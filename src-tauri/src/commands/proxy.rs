use tauri::State;

use crate::app_config::AppType;
use crate::settings::OperationMode;
use crate::store::AppState;
use std::str::FromStr;

/// 切换供应商的代理启用状态
#[tauri::command]
pub async fn toggle_proxy_provider(
    state: State<'_, AppState>,
    provider_id: Option<String>,
    #[allow(non_snake_case)]
    providerId: Option<String>,
    enabled: bool,
    app_type: Option<AppType>,
    app: Option<String>,
    #[allow(non_snake_case)]
    appType: Option<String>,
) -> Result<bool, String> {
    let provider_id = provider_id
        .or(providerId)
        .ok_or_else(|| "缺少 provider_id 参数".to_string())?;

    let app_type = app_type
        .or_else(|| app.as_deref().and_then(|s| AppType::from_str(s).ok()))
        .or_else(|| appType.as_deref().and_then(|s| AppType::from_str(s).ok()))
        .unwrap_or(AppType::Claude);

    let mut config = state
        .config
        .write()
        .map_err(|e| format!("获取配置锁失败: {}", e))?;

    if let Some(provider) = config.providers.get_mut(&app_type).and_then(|providers| {
        providers
            .iter_mut()
            .find(|p| p.id == provider_id)
    }) {
        provider.proxy_enabled = Some(enabled);
    } else {
        return Err(format!("供应商不存在: {}", provider_id));
    }

    drop(config);
    state.save()?;
    Ok(true)
}

/// 处理运行模式变更（启动/停止代理服务器，更新配置）
#[tauri::command]
pub async fn handle_operation_mode_change(
    state: State<'_, AppState>,
    operation_mode: Option<String>,
    #[allow(non_snake_case)]
    operationMode: Option<String>,
    #[allow(non_snake_case)]
    claudeCommonConfig: Option<String>,
    #[allow(non_snake_case)]
    codexCommonConfig: Option<String>,
) -> Result<bool, String> {
    let operation_mode = operation_mode.or(operationMode).unwrap_or_default();

    let mode = if operation_mode == "proxy" {
        OperationMode::Proxy
    } else {
        OperationMode::Write
    };

    match mode {
        OperationMode::Proxy => {
            crate::proxy::switch_to_proxy_mode(
                state.inner(),
                claudeCommonConfig.as_deref(),
                codexCommonConfig.as_deref(),
            )?;

            let state_clone = state.inner().clone();
            tauri::async_runtime::spawn(async move {
                if let Err(e) = crate::proxy::start_proxy_server(&state_clone).await {
                    log::error!("启动代理服务器失败: {}", e);
                }
            });
        }
        OperationMode::Write => {
            crate::proxy::stop_proxy_server().await?;
            crate::proxy::switch_to_write_mode(state.inner())?;
        }
    }

    Ok(true)
}

/// 同步代理模式的通用配置（在应用启动时调用）
#[tauri::command]
pub async fn sync_proxy_common_config(
    state: State<'_, AppState>,
    #[allow(non_snake_case)]
    claudeCommonConfig: Option<String>,
    #[allow(non_snake_case)]
    codexCommonConfig: Option<String>,
) -> Result<bool, String> {
    // 只在代理模式下同步
    let settings = crate::settings::get_settings();
    if settings.operation_mode != crate::settings::OperationMode::Proxy {
        log::warn!("当前不是代理模式，跳过通用配置同步");
        return Ok(false);
    }

    // 调用 switch_to_proxy_mode 来重新生成配置文件
    crate::proxy::switch_to_proxy_mode(
        state.inner(),
        claudeCommonConfig.as_deref(),
        codexCommonConfig.as_deref(),
    )?;

    Ok(true)
}
