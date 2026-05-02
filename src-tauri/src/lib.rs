use tauri::{
    menu::MenuBuilder,
    tray::TrayIconBuilder,
    Manager,
    WindowEvent,
};

const MAIN_WINDOW_LABEL: &str = "main";
const MENU_SHOW: &str = "show";
const MENU_HIDE: &str = "hide";
const MENU_QUIT: &str = "quit";

fn show_main_window(app: &tauri::AppHandle) {
    if let Some(window) = app.get_webview_window(MAIN_WINDOW_LABEL) {
        let _ = window.show();
        let _ = window.unminimize();
        let _ = window.set_focus();
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_notification::init())
        .setup(|app| {
            let tray_menu = MenuBuilder::new(app)
                .text(MENU_SHOW, "Ouvrir FocusForge")
                .text(MENU_HIDE, "Masquer")
                .separator()
                .text(MENU_QUIT, "Quitter FocusForge")
                .build()?;

            let tray_icon = app
                .default_window_icon()
                .cloned()
                .expect("FocusForge should have a bundled tray icon");

            TrayIconBuilder::with_id("focusforge-tray")
                .menu(&tray_menu)
                .icon(tray_icon)
                .icon_as_template(true)
                .tooltip("FocusForge")
                .show_menu_on_left_click(true)
                .on_menu_event(|app, event| match event.id().as_ref() {
                    MENU_SHOW => show_main_window(app),
                    MENU_HIDE => {
                        if let Some(window) = app.get_webview_window(MAIN_WINDOW_LABEL) {
                            let _ = window.hide();
                        }
                    }
                    MENU_QUIT => app.exit(0),
                    _ => {}
                })
                .build(app)?;

            Ok(())
        })
        .on_window_event(|window, event| {
            if window.label() == MAIN_WINDOW_LABEL {
                if let WindowEvent::CloseRequested { api, .. } = event {
                    api.prevent_close();
                    let _ = window.hide();
                }
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running FocusForge");
}
