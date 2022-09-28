const { LocalFolderTemplateSource } = require("..");
const util = require("util");
const fs = require("fs-extra");
const ScafflaterFileNotFoundError = require("../../errors/scafflater-file-not-found-error");
const { TemplateDefinitionNotFound } = require("../../errors");
const logger = require("winston");
/**
 * Gets the template and copies it in a local folder.
 *
 * @param {string} sourceKey - The source key of template. Will vary, depending on template source
 * @param {?string} outputDir - Folder where template must be copied. If null, a temp folder will be used.
 * @returns {Promise<LocalTemplate>} The local template
 */
class PackageTemplateSource extends LocalFolderTemplateSource {
  async getTemplate(sourceKey, outputDir = null) {
    const exec = await util.promisify(require("child_process").exec);
    try {
      await exec("mkdir temp", {
        timeout: 30000,
      });

      const packageStatus = await exec(`cd temp && npm pack ${sourceKey}`, {
        timeout: 30000,
      });

      await exec(
        `cd temp && tar -xvzf ${packageStatus.stdout.replace("/n", "")}`,
        {
          timeout: 30000,
        }
      );

      await exec(`cd temp/package && npm install -D ${sourceKey}`, {
        timeout: 60000,
      });

      const path = process.cwd();
      const pathToClone = `${path}/temp/package`;

      return await super.getTemplate(pathToClone, outputDir);
    } catch (error) {
      if (error instanceof ScafflaterFileNotFoundError) {
        throw new ScafflaterFileNotFoundError(
          `${sourceKey}/.scafflater/scafflater.jsonc`
        );
      }
      if (error instanceof TemplateDefinitionNotFound) {
        throw new TemplateDefinitionNotFound(
          `${sourceKey}/.scafflater/scafflater.jsonc`
        );
      }
      throw error;
    } finally {
      await exec("rm -rf temp", {
        timeout: 30000,
      });
    }
  }

  static async isValidSourceKey(sourceKey) {
    const exec = await util.promisify(require("child_process").exec);
    try {
      await exec(`npm view ${sourceKey}`, {
        timeout: 30000,
      });
      return true;
    } catch (error) {
      if (error.message.includes("404")) {
        return false;
      }
      throw error;
    }
  }
}

module.exports = PackageTemplateSource;
