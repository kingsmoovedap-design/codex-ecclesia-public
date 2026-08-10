// src/main.ts

const app = document.getElementById('app');

if (app) {
  app.innerHTML = `
    <h1>Codex Ecclesia</h1>
    <p>The site is now loading correctly.</p>
  `;
} else {
  console.error("Mount point #app not found");
}
