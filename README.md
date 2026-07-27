
  # Steady Steps Coaching

  1-on-1 mental health counseling website:

  <img width="1878" height="3259" alt="image" src="https://github.com/user-attachments/assets/0b0446cc-7f40-43be-9820-307007927776" />

  ## Running the Application

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

  ## Routing

  File-based routing via [TanStack Router](https://tanstack.com/router): routes live in
  `src/routes/**` and page components in `src/app/**`. See
  [docs/routing.md](docs/routing.md) for conventions, adding routes, and gotchas.

  ## Authoring Blog Articles

  Blog articles start as online Word documents and are converted to Markdown with the
  [markitdown MCP server](https://github.com/trsdn/markitdown-mcp), then mapped into
  typed content blocks in `src/app/blog/_data.ts`. See
  [docs/blog-authoring.md](docs/blog-authoring.md) for the full workflow and setup
  (including the Intel-Mac `cryptography<49` install caveat).

  ## Likes & Comments

  Blog articles persist Like counts and (moderated) Comments via Netlify Blobs and
  Netlify Functions. See [docs/blog-reactions.md](docs/blog-reactions.md) for the data
  model, environment variables, and the SMS-based moderation flow. Run `netlify dev`
  (not `npm run dev`) to exercise the functions locally.
