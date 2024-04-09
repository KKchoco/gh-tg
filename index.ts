const gh_url = "https://api.github.com";
const gh_api = "ghp_000000000000000000000000000000000000";
const tg_api = "0000000000:00000000000000000000000000000000000";
const tg_chat = "000000000";

const post = async (text: string) => {
  await fetch(
    `https://api.telegram.org/bot${tg_api}/sendMessage?chat_id=${tg_chat}&text=${text}`
  );
};

const gh = async (path: string, data?: object) => {
  const method = path.split(" ")[0];
  const route = path.split(" ")[1];

  const response = await fetch(
    route.includes(gh_url) ? route : gh_url + route,
    {
      method: method,
      headers: { Authorization: `Bearer ${gh_api}` },
      body: data !== undefined ? JSON.stringify(data) : "",
    }
  );
  return await response.json();
};

async function checkNotifs() {
  const response = await gh("GET /notifications?participating=true");
  console.log(response);
  if (response.length !== 0) {
    await gh("PUT /notifications", {
      read: true,
    });
  }

  response.map(async (item: any) => {
    if (item.reason === "review_requested") {
      const r = await gh(`GET ${item.subject.url}`);
      await post(
        `${r.user.login} requested review at: ${
          item.repository.name
        }%0ATitle: ${r.title.replace("#", "№")}%0A${r.html_url}`
      );
    }
  });
}

await checkNotifs();
await setInterval(async () => {
  await checkNotifs();
}, 10000);
