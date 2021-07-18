/* eslint-disable no-undef */
const Scafflater = require("./scafflater");
const fsUtil = require("./fs-util");
const git = require("isomorphic-git");

jest.mock("./fs-util");
jest.mock("isomorphic-git");

test("Create Scafflater with github credentials, config in template source should be set", async () => {
  // ARRANGE
  const config = {
    github_username: "some-user",
    github_password: "the-secret-password",
  };
  fsUtil.readJSON.mockResolvedValue({
    name: "template-name",
    version: "template-version",
  });
  const t = `some-user:the-secret-password`;
  const authHeader = `Basic ${Buffer.from(t).toString("base64")}`;

  // ACT
  const scf = new Scafflater(config);
  await scf.templateManager.templateSource.getTemplate(
    "some-source",
    "some-path"
  );

  // ASSERT
  expect(scf.templateManager.templateSource.options.github_username).toBe(
    "some-user"
  );
  expect(scf.templateManager.templateSource.options.github_password).toBe(
    "the-secret-password"
  );
  expect(git.clone.mock.calls[0][0].headers.Authorization).toBe(authHeader);
});
