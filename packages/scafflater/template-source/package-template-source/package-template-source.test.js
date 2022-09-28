/* eslint-disable no-undef */
const PackageTemplateSource = require("./package-template-source");
const util = require("util");

jest.mock("../../fs-util");

describe("getTemplate", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  jest.setTimeout(15000);

  test("get template", async () => {
    jest.spyOn(util, "promisify").mockResolvedValue(() => {
      return { stdout: "", stderr: "" };
    });
    const packageTemplateSource = new PackageTemplateSource();
    expect(
      packageTemplateSource.getTemplate("@gbsandbox/template-fastify")
    ).toBeTruthy();
  });

  test("validate template type", async () => {
    const packageTemplateSource = new PackageTemplateSource();
    jest.spyOn(util, "promisify").mockResolvedValue(() => {
      return { stdout: "", stderr: "" };
    });
    expect(
      PackageTemplateSource.isValidSourceKey("@gbsandbox/template-fastify")
    ).toBeTruthy();
  });

  test("validate package not found", async () => {
    jest.spyOn(util, "promisify").mockReturnValue(() => {
      throw new Error("404");
    });
    expect(
      await PackageTemplateSource.isValidSourceKey(
        "@gbsandbox/template-fastify"
      )
    ).toBe(false);
  });

  test("validate unexpected error ", async () => {
    jest.spyOn(util, "promisify").mockReturnValue(() => {
      throw new Error(
        "Command failed: asdasd\n/bin/sh: asdasd: command not found\n"
      );
    });
    await expect(
      PackageTemplateSource.isValidSourceKey("@gbsandbox/template-fastify")
    ).rejects.toThrow(
      "Command failed: asdasd\n/bin/sh: asdasd: command not found\n"
    );
  });
});
