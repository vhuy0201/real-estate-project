declare namespace google {
    namespace accounts {
        namespace id {
            interface CredentialResponse {
                credential?: string;
                clientId?: string;
            }

            interface IdConfiguration {
                client_id: string;
                callback: (response: CredentialResponse) => void;
                auto_select?: boolean;
                cancel_on_tap_outside?: boolean;
            }

            function initialize(cfg: IdConfiguration): void;
            function prompt(): void;
            function renderButton(
                parent: HTMLElement,
                options: {
                    theme?: "outline" | "filled_blue" | "filled_black";
                    size?: "small" | "medium" | "large";
                    text?: "signin_with" | "signup_with" | "continue_with";
                    shape?: "rectangular" | "pill";
                }
            ): void;
            function cancel(): void;
        }
    }
}

interface Window {
    google: typeof google;
}
