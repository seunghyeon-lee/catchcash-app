import Capacitor
import Foundation
import UIKit

/// Capacitor bridge for the iOS Native AR feasibility spike.
/// Android is intentionally not implemented in this branch.
@objc(NativeARPlugin)
public class NativeARPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "NativeARPlugin"
    public let jsName = "NativeAR"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "startSession", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "placeTestObject", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "stopSession", returnType: CAPPluginReturnPromise),
    ]

    private weak var arViewController: NativeARViewController?

    @objc func startSession(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            if let existing = self.arViewController {
                existing.startWorldTracking()
                call.resolve(["ok": true])
                return
            }

            guard let presenter = self.bridge?.viewController else {
                call.reject("Capacitor viewController를 찾을 수 없습니다.")
                self.emitSessionError(code: "NO_VIEW_CONTROLLER", message: "Capacitor viewController를 찾을 수 없습니다.")
                return
            }

            let viewController = NativeARViewController()
            viewController.plugin = self
            viewController.modalPresentationStyle = .fullScreen
            self.arViewController = viewController
            presenter.present(viewController, animated: true) {
                call.resolve(["ok": true])
            }
        }
    }

    @objc func placeTestObject(_ call: CAPPluginCall) {
        let requestedDistance = call.getFloat("distanceMeters")

        DispatchQueue.main.async {
            guard let viewController = self.arViewController else {
                call.reject("AR session이 없습니다. 먼저 startSession()을 호출하세요.")
                self.emitSessionError(code: "SESSION_NOT_STARTED", message: "AR session이 없습니다.")
                return
            }

            guard let placed = viewController.placeTestCube(distanceMeters: requestedDistance) else {
                call.reject("테스트 cube를 배치하지 못했습니다.")
                return
            }

            call.resolve([
                "objectId": placed.objectId,
                "distanceMeters": placed.distanceMeters,
            ])
        }
    }

    @objc func stopSession(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            guard let viewController = self.arViewController else {
                call.resolve(["ok": true])
                self.notifyListeners("onSessionStopped", data: [:])
                return
            }

            viewController.stopAndDismiss()
            self.arViewController = nil
            call.resolve(["ok": true])
        }
    }

    func emitSessionStarted() {
        notifyListeners("onSessionStarted", data: [:])
    }

    func emitSessionStopped() {
        notifyListeners("onSessionStopped", data: [:])
        arViewController = nil
    }

    func emitSessionError(code: String, message: String) {
        notifyListeners("onSessionError", data: [
            "code": code,
            "message": message,
        ])
    }

    func emitTrackingState(state: String, reason: String? = nil) {
        var payload: [String: Any] = ["state": state]
        if let reason {
            payload["reason"] = reason
        }
        notifyListeners("onTrackingStateChanged", data: payload)
    }

    func emitAnchorPlaced(objectId: String, distanceMeters: Float) {
        notifyListeners("onAnchorPlaced", data: [
            "objectId": objectId,
            "distanceMeters": distanceMeters,
        ])
    }

    func emitObjectTap(objectId: String) {
        notifyListeners("onObjectTap", data: [
            "objectId": objectId,
        ])
    }
}
