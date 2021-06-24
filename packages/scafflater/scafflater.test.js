/* eslint-disable no-undef */
const Scafflater = require('./scafflater')
const fsUtil = require('./fs-util')
const TemplateManager = require('./template-manager')
const Generator = require('./generator')
const ConfigProvider = require('./config-provider')

jest.mock('./template-manager')
jest.mock('./fs-util')
jest.mock('./generator')

test('Simple run partial', async () => {
  // ARRANGE
  const templateManager = new TemplateManager()
  templateManager.config = new ConfigProvider()
  const parameters = {
    domain: 'vs-one',
    systemDescription: 'aaaaaaaa',
    systemName: 'aaaaaaa',
    systemTeam: 'vs-one-team'
  }
  templateManager.templateSource.getTemplate.mockResolvedValue({

  })
  templateManager.getPartial.mockResolvedValueOnce({
    config: {},
    path: 'the/partial/path'
  })
  templateManager.getTemplatePath.mockResolvedValueOnce('/some/path/to/template')
  fsUtil.readJson.mockResolvedValueOnce({
    template: {
      name: 'some-template',
      version: 'some-version',
      source: {
        key: 'the-template-source-key'
      }
    }
  })

  // ACT
  const scafflater = new Scafflater({})
  await scafflater.init('some/template/source/key', parameters, '/some/target')

  // ASSERT
  expect(fsUtil.writeJSON.mock.calls[0][0]).toBe('/some/target/_scf.json')
})

test('No local partial found, but it exists on source', async () => {
  // ARRANGE
  const templateManager = new TemplateManager()
  templateManager.config = new ConfigProvider()
  const parameters = {
    domain: 'vs-one',
    systemDescription: 'aaaaaaaa',
    systemName: 'aaaaaaa',
    systemTeam: 'vs-one-team'
  }
  templateManager.templateSource.getTemplate.mockResolvedValue({

  })
  templateManager.getPartial.mockResolvedValueOnce(null)
  templateManager.getPartial.mockResolvedValueOnce({
    config: {},
    path: 'the/partial/path'
  })
  templateManager.getTemplatePath.mockResolvedValueOnce('/some/path/to/template')
  fsUtil.readJson.mockResolvedValueOnce({
    template: {
      name: 'some-template',
      version: 'some-version',
      source: {
        key: 'the-template-source-key'
      }
    }
  })

  // ACT
  const scafflater = new Scafflater({})
  await scafflater.init('some/template/source/key', parameters, '/some/target')

  // ASSERT
  expect(templateManager.getTemplateFromSource.mock.calls[0][0]).toBe('the-template-source-key')
  expect(fsUtil.writeJSON.mock.calls[0][0]).toBe('/some/target/_scf.json')
})


test('No local partial found, and it does not exists on source too', async () => {
  // ARRANGE
  const templateManager = new TemplateManager()
  templateManager.config = new ConfigProvider()
  const parameters = {
    domain: 'vs-one',
    systemDescription: 'aaaaaaaa',
    systemName: 'aaaaaaa',
    systemTeam: 'vs-one-team'
  }
  templateManager.templateSource.getTemplate.mockResolvedValue({

  })
  templateManager.getPartial.mockResolvedValue(null)
  templateManager.getTemplatePath.mockResolvedValueOnce('/some/path/to/template')
  fsUtil.readJson.mockResolvedValueOnce({
    template: {
      name: 'some-template',
      version: 'some-version',
      source: {
        key: 'the-template-source-key'
      }
    }
  })

  // ACT
  const scafflater = new Scafflater({})
  const result = await scafflater.init('some/template/source/key', parameters, '/some/target')

  // ASSERT
  expect(result).toBe(null)
})