import fs from "fs";
import { compile } from "handlebars";
import { minify } from "html-minifier";
import mjml2html from "mjml";

/**
 * Creates a Handlebars template from an email filename.
 * Automatically embeds the file within `_template.mjml`.
 * @param fileName Name of the `.mjml` file to prepare
 * @returns A Handlebars template of the email
 * @example
 * ```js
 * const template = prepareEmail("emails/reminder");
 * const html = template({ title: "Example" })
 * ```
 */
const createEmailTemplate = (fileName: string) => {
  if (!fileName.endsWith(".mjml")) fileName += ".mjml";

  // Embed the file within `_template.mjml`
  const file = fs.readFileSync(fileName, "utf-8");
  const mjmlTemplate = fs.readFileSync("emails/_template.mjml", "utf-8");
  const fullMjml = mjmlTemplate.replace("{{ EMAIL_BODY_CONTENT }}", file);

  // Process the MJML into HTML and create the template
  const { html: mjmlHtml } = mjml2html(fullMjml);
  const minified = minify(mjmlHtml, { minifyCSS: true });
  const template = compile(minified, {});

  return template;
};

export default createEmailTemplate;
