import UIKit
import Capacitor
import Network

class SceneDelegate: UIResponder, UIWindowSceneDelegate {
    var window: UIWindow?
    private let networkMonitor = NWPathMonitor()
    private let networkMonitorQueue = DispatchQueue(label: "com.financetracker.network-monitor")
    private var wasOffline = true

    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        guard let windowScene = scene as? UIWindowScene else { return }

        window = UIWindow(windowScene: windowScene)
        window?.rootViewController = CAPBridgeViewController()
        window?.makeKeyAndVisible()

        networkMonitor.pathUpdateHandler = { [weak self] path in
            let isOnline = path.status == .satisfied
            guard let self else { return }

            if isOnline && self.wasOffline {
                DispatchQueue.main.async {
                    (self.window?.rootViewController as? CAPBridgeViewController)?.bridge?.webView.reload()
                }
            }
            self.wasOffline = !isOnline
        }
        networkMonitor.start(queue: networkMonitorQueue)

        SceneDelegateProxy.shared.scene(scene, willConnectTo: session, options: connectionOptions)
    }

    func sceneDidDisconnect(_ scene: UIScene) {
        networkMonitor.cancel()
    }

    func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
        SceneDelegateProxy.shared.scene(scene, openURLContexts: URLContexts)
    }

    func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
        SceneDelegateProxy.shared.scene(scene, continue: userActivity)
    }
}
