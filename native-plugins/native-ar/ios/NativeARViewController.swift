import ARKit
import RealityKit
import UIKit

/// Fullscreen ARKit/RealityKit session used only by the iOS Native AR spike.
///
/// The test cube is attached to a world-space `AnchorEntity` once.
/// It is never re-parented to the camera and never updated every frame.
final class NativeARViewController: UIViewController, ARSessionDelegate {
    weak var plugin: NativeARPlugin?

    private let arView = ARView(frame: .zero)
    private let statusLabel = UILabel()
    private let placeButton = UIButton(type: .system)
    private let stopButton = UIButton(type: .system)

    private var testCubeAnchor: AnchorEntity?
    private var placedObjectId: String?
    private var isSessionRunning = false

    private let defaultDistanceMeters: Float = 1.5
    private let cubeSizeMeters: Float = 0.2

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .black
        configureARView()
        configureOverlay()
        configureTapRecognizer()
    }

    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        startWorldTracking()
    }

    override func viewWillDisappear(_ animated: Bool) {
        super.viewWillDisappear(animated)
        pauseSession()
    }

    func startWorldTracking() {
        guard ARWorldTrackingConfiguration.isSupported else {
            plugin?.emitSessionError(code: "AR_UNSUPPORTED", message: "이 기기는 ARWorldTracking을 지원하지 않습니다.")
            return
        }

        let configuration = ARWorldTrackingConfiguration()
        configuration.worldAlignment = .gravity
        configuration.planeDetection = []
        arView.session.delegate = self
        arView.session.run(configuration, options: [.resetTracking, .removeExistingAnchors])
        isSessionRunning = true
        setOverlayStatus("AR session running")
        plugin?.emitSessionStarted()
    }

    func placeTestCube(distanceMeters: Float?) -> (objectId: String, distanceMeters: Float)? {
        guard isSessionRunning else {
            plugin?.emitSessionError(code: "SESSION_NOT_STARTED", message: "AR session이 시작되지 않았습니다.")
            return nil
        }

        guard let cameraTransform = arView.session.currentFrame?.camera.transform else {
            plugin?.emitSessionError(code: "NO_CAMERA_FRAME", message: "현재 카메라 프레임을 아직 사용할 수 없습니다.")
            return nil
        }

        let distance = max(distanceMeters ?? defaultDistanceMeters, 0.3)
        var cameraSpaceOffset = matrix_identity_float4x4
        cameraSpaceOffset.columns.3.z = -distance
        let worldTransform = cameraTransform * cameraSpaceOffset

        removeExistingTestCube()

        let objectId = "ios-spike-cube-\(Int(Date().timeIntervalSince1970 * 1000))"
        let mesh = MeshResource.generateBox(size: cubeSizeMeters)
        let material = SimpleMaterial(color: .systemYellow, roughness: 0.25, isMetallic: false)
        let cube = ModelEntity(mesh: mesh, materials: [material])
        cube.name = objectId
        cube.generateCollisionShapes(recursive: true)

        // World-space anchor. Do not use AnchorEntity(.camera) and do not update this pose later.
        let anchor = AnchorEntity(world: worldTransform)
        anchor.name = objectId
        anchor.addChild(cube)
        arView.scene.addAnchor(anchor)

        testCubeAnchor = anchor
        placedObjectId = objectId
        setOverlayStatus("Cube anchored \(String(format: "%.1f", distance))m ahead")
        plugin?.emitAnchorPlaced(objectId: objectId, distanceMeters: distance)
        return (objectId, distance)
    }

    func stopAndDismiss() {
        pauseSession()
        plugin?.emitSessionStopped()
        dismiss(animated: true)
    }

    func pauseSession() {
        guard isSessionRunning else { return }
        arView.session.pause()
        isSessionRunning = false
    }

    func session(_ session: ARSession, cameraDidChangeTrackingState camera: ARCamera) {
        switch camera.trackingState {
        case .notAvailable:
            setOverlayStatus("Tracking: notAvailable")
            plugin?.emitTrackingState(state: "notAvailable")
        case .limited(let reason):
            let reasonText = trackingReasonText(reason)
            setOverlayStatus("Tracking: limited (\(reasonText))")
            plugin?.emitTrackingState(state: "limited", reason: reasonText)
        case .normal:
            setOverlayStatus("Tracking: normal")
            plugin?.emitTrackingState(state: "normal")
        @unknown default:
            setOverlayStatus("Tracking: unknown")
            plugin?.emitTrackingState(state: "notAvailable", reason: "unknown")
        }
    }

    private func configureARView() {
        arView.translatesAutoresizingMaskIntoConstraints = false
        arView.automaticallyConfigureSession = false
        arView.renderOptions.insert(.disableMotionBlur)
        view.addSubview(arView)

        NSLayoutConstraint.activate([
            arView.topAnchor.constraint(equalTo: view.topAnchor),
            arView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            arView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            arView.bottomAnchor.constraint(equalTo: view.bottomAnchor),
        ])
    }

    private func configureOverlay() {
        let stack = UIStackView(arrangedSubviews: [statusLabel, placeButton, stopButton])
        stack.axis = .vertical
        stack.spacing = 8
        stack.translatesAutoresizingMaskIntoConstraints = false

        statusLabel.text = "AR 준비 중"
        statusLabel.textColor = .white
        statusLabel.font = .monospacedSystemFont(ofSize: 13, weight: .medium)
        statusLabel.numberOfLines = 0

        placeButton.setTitle("Place Test Cube", for: .normal)
        placeButton.backgroundColor = UIColor.black.withAlphaComponent(0.65)
        placeButton.setTitleColor(.white, for: .normal)
        placeButton.layer.cornerRadius = 8
        placeButton.addTarget(self, action: #selector(handlePlaceTapped), for: .touchUpInside)

        stopButton.setTitle("Stop AR", for: .normal)
        stopButton.backgroundColor = UIColor.black.withAlphaComponent(0.65)
        stopButton.setTitleColor(.white, for: .normal)
        stopButton.layer.cornerRadius = 8
        stopButton.addTarget(self, action: #selector(handleStopTapped), for: .touchUpInside)

        view.addSubview(stack)
        NSLayoutConstraint.activate([
            stack.leadingAnchor.constraint(equalTo: view.safeAreaLayoutGuide.leadingAnchor, constant: 16),
            stack.trailingAnchor.constraint(equalTo: view.safeAreaLayoutGuide.trailingAnchor, constant: -16),
            stack.bottomAnchor.constraint(equalTo: view.safeAreaLayoutGuide.bottomAnchor, constant: -16),
            placeButton.heightAnchor.constraint(equalToConstant: 44),
            stopButton.heightAnchor.constraint(equalToConstant: 44),
        ])
    }

    private func configureTapRecognizer() {
        let tap = UITapGestureRecognizer(target: self, action: #selector(handleSceneTap(_:)))
        arView.addGestureRecognizer(tap)
    }

    @objc private func handlePlaceTapped() {
        _ = placeTestCube(distanceMeters: defaultDistanceMeters)
    }

    @objc private func handleStopTapped() {
        stopAndDismiss()
    }

    @objc private func handleSceneTap(_ sender: UITapGestureRecognizer) {
        let location = sender.location(in: arView)
        guard let entity = arView.entity(at: location) else { return }
        let objectId = placedObjectId ?? entity.name
        guard !objectId.isEmpty else { return }
        plugin?.emitObjectTap(objectId: objectId)
        setOverlayStatus("Object tapped: \(objectId)")
    }

    private func removeExistingTestCube() {
        if let existing = testCubeAnchor {
            arView.scene.removeAnchor(existing)
        }
        testCubeAnchor = nil
        placedObjectId = nil
    }

    private func setOverlayStatus(_ text: String) {
        DispatchQueue.main.async {
            self.statusLabel.text = text
        }
    }

    private func trackingReasonText(_ reason: ARCamera.TrackingState.Reason) -> String {
        switch reason {
        case .initializing:
            return "initializing"
        case .excessiveMotion:
            return "excessiveMotion"
        case .insufficientFeatures:
            return "insufficientFeatures"
        case .relocalizing:
            return "relocalizing"
        @unknown default:
            return "unknown"
        }
    }
}
