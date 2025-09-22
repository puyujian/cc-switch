/**
 * Codex 预设供应商配置模板
 */
import { ProviderCategory } from "../types";

export interface CodexProviderPreset {
  name: string;
  websiteUrl: string;
  auth: Record<string, any>; // 将写入 ~/.codex/auth.json
  config: string; // 将写入 ~/.codex/config.toml（TOML 字符串）
  isOfficial?: boolean; // 标识是否为官方预设
  category?: ProviderCategory; // 新增：分类
  isCustomTemplate?: boolean; // 标识是否为自定义模板
}

/**
 * 生成自用供应商的 auth.json
 */
export function generateZiyongAuth(apiKey: string): Record<string, any> {
  return {
    OPENAI_API_KEY: apiKey || "sk-your-api-key-here"
  };
}

/**
 * 生成自用供应商的 config.toml
 */
export function generateZiyongConfig(
  baseUrl: string,
  modelName = "gpt-5-codex"
): string {
  return `model_provider = "ziyong"
model = "${modelName}"
model_reasoning_effort = "high"
disable_response_storage = true

[model_providers.ziyong]
name = "ziyong"
base_url = "${baseUrl}"
wire_api = "responses"
env_key = "ziyong"

[projects.'\\\\?\\C:\\Users\\60350\\Desktop\\halo-plugin-vditor']
trust_level = "trusted"

[projects.'\\\\?\\C:\\Users\\60350\\Desktop\\xhs']
trust_level = "trusted"

[projects.'\\\\?\\C:\\Users\\60350\\CF2DNS']
trust_level = "trusted"

[projects.'C:\\Users\\60350\\.codex']
trust_level = "trusted"

[projects.'\\\\?\\C:\\Users\\60350\\Desktop\\官网']
trust_level = "trusted"

# --- MCP servers added by Codex CLI ---
[mcp_servers.context7]
command = "C:\\\\Users\\\\60350\\\\AppData\\\\Roaming\\\\npm\\\\context7-mcp.cmd"
args = []
env = {SYSTEMROOT = 'C:\\Windows'}

[mcp_servers.sequential-thinking]
command = "C:\\\\Users\\\\60350\\\\AppData\\\\Roaming\\\\npm\\\\mcp-server-sequential-thinking.cmd"
args = []
env = {SYSTEMROOT = 'C:\\Windows'}

[mcp_servers.playwright]
command = "C:\\\\Users\\\\60350\\\\AppData\\\\Roaming\\\\npm\\\\mcp-server-playwright.cmd"
args = []
env = {SYSTEMROOT = 'C:\\Windows'}

[mcp_servers.mcp-server-time]
command = "C:\\\\Users\\\\60350\\\\AppData\\\\Local\\\\Programs\\\\Python\\\\Python313\\\\Scripts\\\\uvx.exe"
args = ["mcp-server-time", "--local-timezone=Asia/Shanghai"]
env = {SYSTEMROOT = 'C:\\Windows'}

[mcp_servers.mcp-shrimp-task-manager]
command = "C:\\\\Users\\\\60350\\\\AppData\\\\Roaming\\\\npm\\\\mcp-shrimp-task-manager.cmd"
args = []
env = { DATA_DIR = "C:/Users/60350/.codex/mcp-data/shrimp", TEMPLATES_USE = "zh", ENABLE_GUI = "false" }

[mcp_servers.mcp-deepwiki]
command = "C:\\\\Program Files\\\\nodejs\\\\npx.cmd"
args = ["-y", "mcp-deepwiki@latest"]
env = {SYSTEMROOT = 'C:\\Windows'}

[mcp_servers.desktop-commander]
command = "C:\\\\Users\\\\60350\\\\AppData\\\\Roaming\\\\npm\\\\desktop-commander.cmd"
args = []
env = {SYSTEMROOT = 'C:\\Windows'}

[mcp_servers.exa]
command = "C:\\\\Users\\\\60350\\\\AppData\\\\Roaming\\\\npm\\\\mcp-server-exa.cmd"
args = []
env = {SYSTEMROOT = 'C:\\Windows'}
# --- End MCP servers ---`;
}
export function generateThirdPartyAuth(apiKey: string): Record<string, any> {
  return {
    OPENAI_API_KEY: apiKey || "sk-your-api-key-here"
  };
}

/**
 * 生成第三方供应商的 config.toml
 */
export function generateThirdPartyConfig(
  providerName: string,
  baseUrl: string,
  modelName = "gpt-5-codex"
): string {
  // 清理供应商名称，确保符合TOML键名规范
  const cleanProviderName = providerName
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/^_+|_+$/g, '') || 'custom';
  
  return `model_provider = "${cleanProviderName}"
model = "${modelName}"
model_reasoning_effort = "high"
disable_response_storage = true
requires_openai_auth = true

[model_providers.${cleanProviderName}]
name = "${cleanProviderName}"
base_url = "${baseUrl}"
wire_api = "responses"
env_key = "${cleanProviderName}"`;
}

export const codexProviderPresets: CodexProviderPreset[] = [
  {
    name: "Codex官方",
    websiteUrl: "https://chatgpt.com/codex",
    isOfficial: true,
    category: "official",
    auth: {
      OPENAI_API_KEY: null,
    },
    config: ``,
  },
  {
    name: "自用",
    websiteUrl: "",
    category: "ziyong",
    isCustomTemplate: true,
    auth: generateZiyongAuth(""),
    config: generateZiyongConfig("https://your-api-endpoint.com/v1", "gpt-5-codex"),
  },
  {
    name: "PackyCode",
    websiteUrl: "https://codex.packycode.com/",
    category: "third_party",
    auth: generateThirdPartyAuth("sk-your-api-key-here"),
    config: generateThirdPartyConfig(
      "packycode",
      "https://codex-api.packycode.com/v1",
      "gpt-5-codex"
    ),
  },
];
