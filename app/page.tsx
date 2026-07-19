"use client";

import { useState } from "react";

const skills = [
  {
    title: "Web Development",
    description:
      "Building fast, accessible, and responsive web apps with modern frameworks.",
  },
  {
    title: "Backend & APIs",
    description:
      "Designing reliable APIs and services that scale with your product.",
  },
  {
    title: "UI/UX Design",
    description: "Crafting clean, intuitive interfaces that feel great to use.",
  },
  {
    title: "DevOps & Deployment",
    description:
      "Setting up CI/CD, hosting, and infrastructure so shipping is effortless.",
  },
];

const projects = [
  {
    title: "Project One",
    description:
      "A short description of this project and the problem it solves.",
    tags: ["Next.js", "TypeScript"],
  },
  {
    title: "Project Two",
    description:
      "A short description of this project and the problem it solves.",
    tags: ["React", "Node.js"],
  },
  {
    title: "Project Three",
    description:
      "A short description of this project and the problem it solves.",
    tags: ["Python", "PostgreSQL"],
  },
];

export default function Home() {
  const [prompt, setPrompt] = useState("");

  return (
    <div className="flex flex-1 flex-col">
      <section className="relative flex h-svh w-full flex-col items-center justify-center px-6">
        <div className="flex max-w-xl flex-col items-center gap-3">
          <div className="flex flex-col items-center text-4xl -ml-2 -mb-7 z-1">
            <h1 className="sm:text-5xl text-3xl font-semibold -mb-17 ml-32">
              it all starts with a{" "}
            </h1>
            <span className="text-accent font-bold text-5xl sm:text-9xl tracking-tight text-shadow-2xl">
              <span className="text-[165px]">M</span>
              essage
            </span>
          </div>

          <form
            onSubmit={(event) => event.preventDefault()}
            className="w-[535px] rounded-3xl border border-transparent focus-within:border-border bg-surface px-4 py-3 shadow-lg shadow-black/3 sm:px-5 sm:py-4"
          >
            <textarea
              value={prompt}
              autoFocus={true}
              rows={2}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="press enter to send an empty one..."
              className="w-full resize-none bg-transparent text-base text-foreground placeholder:text-muted focus:outline-none"
            />
            <div className="mt-3 flex items-center justify-end">
              <button
                type="submit"
                aria-label="Send"
                className="flex h-9 w-9 items-center justify-center text-white transition-opacity hover:opacity-90 rounded-xl hover:bg-background/80"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M12 19V5" />
                  <path d="M5 12l7-7 7 7" />
                </svg>
              </button>
            </div>
          </form>

          <button
            type="button"
            className="text-sm text-muted underline-offset-4 hover:underline -mt-1 ml-8 mr-auto"
          >
            already been here?
          </button>
        </div>

        <div className="absolute bottom-8 flex flex-col items-center gap-2 text-muted">
          <span className="text-xs uppercase tracking-widest">
            Scroll to explore
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4 animate-bounce"
          >
            <path d="M12 5v14" />
            <path d="M19 12l-7 7-7-7" />
          </svg>
        </div>
      </section>

      <section className="w-full px-6 py-24 sm:py-32">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-12">
          <div className="flex flex-col gap-3">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              What I do
            </h2>
            <p className="max-w-md text-base text-muted">
              A few of the things I bring to every project.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {skills.map((skill) => (
              <div
                key={skill.title}
                className="flex flex-col gap-2 rounded-2xl border border-border bg-surface p-6"
              >
                <h3 className="text-lg font-medium text-foreground">
                  {skill.title}
                </h3>
                <p className="text-sm text-muted">{skill.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="w-full px-6 py-24 sm:py-32">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-12">
          <div className="flex flex-col gap-3">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Selected work
            </h2>
            <p className="max-w-md text-base text-muted">
              A sample of projects I&apos;ve worked on.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {projects.map((project) => (
              <div
                key={project.title}
                className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-6"
              >
                <div className="flex h-32 w-full items-center justify-center rounded-xl bg-surface-muted text-sm text-muted">
                  Preview
                </div>
                <h3 className="text-lg font-medium text-foreground">
                  {project.title}
                </h3>
                <p className="text-sm text-muted">{project.description}</p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-surface-muted px-3 py-1 text-xs text-muted"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="w-full border-t border-border px-6 py-10 text-center text-sm text-muted">
        © {new Date().getFullYear()} Shahzaib. Available for freelance work.
      </footer>
    </div>
  );
}
