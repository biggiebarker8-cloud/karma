// swift-tools-version: 5.9

import PackageDescription

let package = Package(
    name: "KarmaCore",
    platforms: [.iOS(.v17)],
    products: [
        .library(
            name: "KarmaCore",
            targets: ["KarmaCore"]
        ),
    ],
    targets: [
        .target(name: "KarmaCore"),
        .testTarget(
            name: "KarmaCoreTests",
            dependencies: ["KarmaCore"]
        ),
    ]
)
