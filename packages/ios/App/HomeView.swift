import KarmaCore
import SafariServices
import SwiftUI

private struct BrowserPage: Identifiable {
    let id = UUID()
    let url: URL
}

private struct BrowserView: UIViewControllerRepresentable {
    let url: URL

    func makeUIViewController(context: Context) -> SFSafariViewController {
        SFSafariViewController(url: url)
    }

    func updateUIViewController(_ controller: SFSafariViewController, context: Context) {}
}

struct HomeView: View {
    @AppStorage("openclawWebAddress") private var openclawAddress = ""
    @State private var browserPage: BrowserPage?

    private var openclawURL: URL? {
        SecureWebAddress.parse(openclawAddress)
    }

    var body: some View {
        TabView {
            NavigationStack {
                VStack(spacing: 20) {
                    Text("ChatGPT")
                        .font(.largeTitle.bold())
                    Text("Chat with ChatGPT using its official website. Sign in with your own account.")
                        .multilineTextAlignment(.center)
                    Button("Open ChatGPT") {
                        if let url = URL(string: "https://chatgpt.com/") {
                            browserPage = BrowserPage(url: url)
                        }
                    }
                    .buttonStyle(.borderedProminent)
                }
                .padding()
                .navigationTitle("Karma")
            }
            .tabItem { Label("ChatGPT", systemImage: "bubble.left.and.bubble.right") }

            NavigationStack {
                VStack(spacing: 20) {
                    Text("OpenClaw")
                        .font(.largeTitle.bold())
                    Text(openclawURL == nil
                         ? "Add your OpenClaw HTTPS web address in Settings to open it here."
                         : "Your OpenClaw web address is ready to open.")
                        .multilineTextAlignment(.center)
                    Button("Open OpenClaw") {
                        if let url = openclawURL {
                            browserPage = BrowserPage(url: url)
                        }
                    }
                    .buttonStyle(.borderedProminent)
                    .disabled(openclawURL == nil)
                }
                .padding()
                .navigationTitle("OpenClaw")
            }
            .tabItem { Label("OpenClaw", systemImage: "link") }

            NavigationStack {
                VStack(spacing: 20) {
                    Text("Lark")
                        .font(.largeTitle.bold())
                    Text("Awaiting AnyCross and Lark setup")
                        .font(.headline)
                    Text("This app does not have Lark access yet. An administrator must approve the integration and provide a secure server-side connection before it can be enabled.")
                        .multilineTextAlignment(.center)
                }
                .padding()
                .navigationTitle("Lark")
            }
            .tabItem { Label("Lark", systemImage: "network") }

            NavigationStack {
                Form {
                    Section("OpenClaw website") {
                        TextField("https://your-openclaw.example", text: $openclawAddress)
                            .keyboardType(.URL)
                            .textInputAutocapitalization(.never)
                            .autocorrectionDisabled()
                            .accessibilityLabel("OpenClaw HTTPS web address")
                        Text("Use an HTTPS address without a username, password, query, or fragment. Do not enter API keys.")
                            .font(.footnote)
                        if !openclawAddress.isEmpty && openclawURL == nil {
                            Text("Enter a valid HTTPS web address.")
                                .foregroundStyle(.red)
                        }
                    }
                    Section("Integrations") {
                        Text("ChatGPT opens the official website. OpenClaw opens your configured website. AnyCross-to-Lark requires administrator setup.")
                    }
                }
                .navigationTitle("Settings")
            }
            .tabItem { Label("Settings", systemImage: "gearshape") }
        }
        .sheet(item: $browserPage) { page in
            BrowserView(url: page.url)
        }
    }
}
