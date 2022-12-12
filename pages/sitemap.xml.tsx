/**
 * Dynamically generate a sitemap for Alu
 * @see https://www.sitemaps.org/protocol.html
 * @see https://leerob.io/blog/nextjs-sitemap-robots
 */
import { globby } from "globby";
import prisma from "lib/prisma";
import type { GetServerSideProps } from "next";

const Sitemap: React.FC = () => null;

const priorities = new Map([
  ["about", 1.0],
  ["home", 1.0],
  ["auto-flashcards", 1.0],
  ["", 1.0],
  ["changelog", 0.7],
  ["archived", 0.1],
  ["me", 0.1],
  ["new-user-survey", 0.3],
  ["new-user-survey", 0.3],
  ["settings", 0.5],
  ["verify-request", 0.1],
]);

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  if (res) {
    const pages = await globby([
      "pages/*.ts",
      "pages/*.tsx",
      "!pages/_*.ts",
      "!pages/_*.tsx",
      "!pages/api",
      "!pages/404.tsx",
      "!pages/500.jsx",
    ]);

    const sharedCourses = await prisma.course.findMany({
      where: {
        privacySetting: "ALL",
        isPublic: true,
      },
      select: {
        id: true,
        courseSections: {
          select: {
            slug: true,
            subSections: {
              select: {
                slug: true,
              },
            },
          },
        },
      },
    });

    res.setHeader("Content-Type", "text/xml");
    res.write(`<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${pages
        .map((page) => {
          const path = page
            .replace("pages", "")
            .replace("data", "")
            .replace(".tsx", "")
            .replace(".ts", "");
          const route = path === "/index" ? "" : path;
          const priority = priorities.get(route.replace("/", ""));

          return `
              <url>
                <loc>https://alulearn.com${route}</loc>
                <priority>${priority ?? 0.5}</priority>
              </url>
            `;
        })
        .join("")}
      ${sharedCourses
        .map(
          (course) => `<url>
          <loc>https://alulearn.com/course/${course.id}</loc>
          <priority>0.9</priority>
          <changefreq>weekly</changefreq>
      </url><url>
          <loc>https://alulearn.com/course/${course.id}/flashcards</loc>
          <priority>0.9</priority>
      </url>${course.courseSections
        .map(
          (courseSection) => `<url>
          <loc>https://alulearn.com/course/${course.id}/flashcards/${
            courseSection.slug
          }</loc>
          <priority>0.8</priority>
      </url>${courseSection.subSections
        .map(
          (subSection) => `<url>
        <loc>https://alulearn.com/course/${course.id}/flashcards/${courseSection.slug}/${subSection.slug}</loc>
          <priority>0.7</priority>
      </url>`
        )
        .join("")}`
        )
        .join("")}`
        )
        .join("")}
    </urlset>`);
    res.end();
  }

  return {
    props: {},
  };
};

export default Sitemap;
