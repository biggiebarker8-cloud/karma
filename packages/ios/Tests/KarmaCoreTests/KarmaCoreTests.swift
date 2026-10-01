import XCTest
@testable import KarmaCore

final class KarmaCoreTests: XCTestCase {
    func testAcceptsHTTPSAddress() {
        XCTAssertEqual(
            SecureWebAddress.parse("  https://openclaw.example.org/app  ")?.absoluteString,
            "https://openclaw.example.org/app"
        )
    }

    func testRejectsUnsafeAddresses() {
        for address in [
            "", "http://openclaw.example.org", "javascript:alert(1)",
            "https://user@openclaw.example.org",
            "https://openclaw.example.org/?token=secret",
            "https://openclaw.example.org/#token",
            "https:///app"
        ] {
            XCTAssertNil(SecureWebAddress.parse(address), address)
        }
    }
}
