use std::sync::atomic::{AtomicBool, Ordering};

use tauri::{
    image::Image,
    menu::MenuBuilder,
    tray::TrayIconBuilder,
    Manager,
    RunEvent,
    WindowEvent,
};

const MAIN_WINDOW_LABEL: &str = "main";
const MENU_SHOW: &str = "show";
const MENU_HIDE: &str = "hide";
const MENU_QUIT: &str = "quit";

struct AppState {
    allow_quit: AtomicBool,
}

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
        .manage(AppState {
            allow_quit: AtomicBool::new(false),
        })
        .plugin(tauri_plugin_notification::init())
        .setup(|app| {
            let tray_menu = MenuBuilder::new(app)
                .text(MENU_SHOW, "Ouvrir FocusForge")
                .text(MENU_HIDE, "Masquer")
                .separator()
                .text(MENU_QUIT, "Quitter FocusForge")
                .build()?;

            let tray_icon = Image::from_bytes(include_bytes!("../icons/tray-icon.png"))?;

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
                    MENU_QUIT => {
                        app.state::<AppState>()
                            .allow_quit
                            .store(true, Ordering::SeqCst);
                        app.exit(0);
                    }
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
        .build(tauri::generate_context!())
        .expect("error while running FocusForge")
        .run(|app, event| {
            if let RunEvent::ExitRequested { api, .. } = event {
                let should_quit = app
                    .state::<AppState>()
                    .allow_quit
                    .load(Ordering::SeqCst);

                if !should_quit {
                    api.prevent_exit();
                    show_main_window(app);
                    if let Some(window) = app.get_webview_window(MAIN_WINDOW_LABEL) {
                        let _ = window.hide();
                    }
                }
            }
        });
}
