# Expense & Budget Visualizer

A lightweight, mobile-friendly web app for tracking daily spending. Add transactions, watch your balance update in real time, and visualize where your money goes — all without a backend or build step.

---

## Features

- **Add & delete transactions** with name, amount, and category
- **Live balance** that updates automatically on every change
- **Pie chart** (Chart.js) showing spending distribution by category
- **Sort transactions** by amount (low→high, high→low) or category A–Z *(OC-3)*
- **Spending limit highlight** — balance card turns red when you exceed your budget *(OC-4)*
- **Dark / Light mode toggle** — theme preference persisted across sessions *(OC-5)*
- **100% client-side** — all data stored in browser Local Storage, no server required

---

## Running Locally

No build tools or dependencies to install. Just open the file in your browser:

1. Clone or download this repository.
2. Open `index.html` directly in Chrome, Firefox, Edge, or Safari.

```
# Example using a simple HTTP server (optional, any method works)
npx serve .
```

That's it — the app is fully functional from the filesystem.

---

## Live Demo (GitHub Pages)

```
https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/
```

Replace `YOUR_USERNAME` and `YOUR_REPO_NAME` with your actual GitHub username and repository name after enabling GitHub Pages in the repo settings (Settings → Pages → Branch: `main`, folder: `/root`).

---

## Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Markup     | HTML5                             |
| Styles     | CSS3 with custom properties       |
| Logic      | Vanilla JavaScript (ES2020+)      |
| Chart      | [Chart.js v4](https://www.chartjs.org/) via CDN |
| Storage    | Browser Local Storage             |

---

## File Structure

```
index.html        ← single page entry point
css/
  style.css       ← all styles (light/dark themes, responsive layout)
js/
  app.js          ← all application logic
```

---

## License

See [LICENSE.md](LICENSE.md).
