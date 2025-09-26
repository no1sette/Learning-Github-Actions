import http, { head } from "k6/http";
import { check, sleep, group } from "k6";

export let options = {
  stages: [
    { duration: "5s", target: 20 }, // ramp up to 20 users
    { duration: "1m", target: 20 }, // stay at 20 users
    { duration: "5s", target: 0 }, // ramp down to 0 users
  ],
};
const url = "https://quickpizza.grafana.com";

export default function () {
  const login = {
    username: "default",
    password: "12345678",
  };

  const headers = { "Content-Type": "application/json" };

  group("Public endpoints", function () {
    let res = http.get("https://quickpizza.grafana.com");
    check(res, { "status was 200": (r) => r.status == 200 });
    sleep(1);
  });

  group("Private endpoints", function () {
    let loginRes = http.post(
      "https://quickpizza.grafana.com/login/",
      JSON.stringify({ login }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    check(loginRes, { "login status was 200": (r) => r.status == 200 });

    let authHeaders = {
      headers: {
        Authorization: 'Bearer ${loginres.json("access")}',
      },
    };

    let res = http.get("https://quickpizza.grafana.com", authHeaders);
    check(res, { "status was 200": (r) => r.status == 200 });
    sleep(1);
  });
}
