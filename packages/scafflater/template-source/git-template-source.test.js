/* eslint-disable no-undef */
const GitTemplateSource = require("./git-template-source");
const GitUtil = require("../git-util");
const fsUtil = require("../fs-util");
const TemplateSource = require("./");

jest.mock("../git-util");
jest.mock("../fs-util");

describe("Github template source", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("Valid source key", () => {
    expect(
      GitTemplateSource.isValidSourceKey(
        "https://github.com/some-org/some-repo"
      )
    ).toBeTruthy();
    expect(
      GitTemplateSource.isValidSourceKey("http://github.com/some-org/some-repo")
    ).toBeTruthy();
    expect(
      GitTemplateSource.isValidSourceKey(
        "https://dev.azure.com/some-org/some-repo"
      )
    ).toBeFalsy();
  });

  test("Config with username and password", () => {
    // ARRANGE
    const options = {
      github_username: "some-user",
      github_password: "the-secret-password",
    };

    // ACT
    const ts = new TemplateSource(options);

    // ASSERT
    expect(ts.options.github_username).toBe("some-user");
    expect(ts.options.github_password).toBe("the-secret-password");
    expect(ts.options.github_baseUrlApi).toBe("https://api.github.com");
    expect(ts.options.github_baseUrl).toBe("https://github.com");
  });

  test("Should clone to the folder in parameter", async () => {
    // ARRANGE
    const repo = "some/repo";
    const virtualFolder = "some/virtual/folder";
    const gitTemplateSource = new GitTemplateSource();
    fsUtil.readJSON.mockResolvedValue({
      name: "template-name",
      version: "0.0.0",
      parameters: [{ name: "some-parameter" }],
    });

    // ACT
    const out = await gitTemplateSource.getTemplate(repo, virtualFolder);

    // ASSERT
    expect(out).toStrictEqual({
      path: virtualFolder,
      config: {
        name: "template-name",
        version: "0.0.0",
        parameters: [{ name: "some-parameter" }],
        source: {
          name: "github",
          key: "some/repo",
          github: {
            baseUrlApi: "https://api.github.com",
            baseUrl: "https://github.com",
          },
        },
      },
    });
    expect(GitUtil.clone.mock.calls[0][0]).toBe(repo);
  });

  test("Should clone to a temp folder", async () => {
    // ARRANGE
    const repo = "some/repo";
    const tempFolder = "some/temp/folder";
    const gitTemplateSource = new GitTemplateSource();
    fsUtil.readJSON.mockResolvedValue({
      name: "template-name",
      version: "0.0.0",
      parameters: [{ name: "some-parameter" }],
    });
    fsUtil.getTempFolder.mockResolvedValue(tempFolder);

    // ACT
    const out = await gitTemplateSource.getTemplate(repo);

    // ASSERT
    expect(out).toStrictEqual({
      path: tempFolder,
      config: {
        name: "template-name",
        version: "0.0.0",
        parameters: [{ name: "some-parameter" }],
        source: {
          name: "github",
          key: "some/repo",
          github: {
            baseUrlApi: "https://api.github.com",
            baseUrl: "https://github.com",
          },
        },
      },
    });
    expect(GitUtil.clone.mock.calls[0][0]).toBe(repo);
    expect(GitUtil.clone.mock.calls[0][1]).toBe(tempFolder);
  });
});
