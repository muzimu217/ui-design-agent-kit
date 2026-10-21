// OCR + layout inspector using Apple Vision. Emits JSON: text boxes, confidence, and
// per-box contrast estimate against local background.
// Usage: swift scripts/vision-ocr.swift <image.png> [more.png ...]
import Foundation
import Vision
import AppKit

struct Box: Codable {
    let text: String
    let confidence: Float
    let x: Double
    let y: Double
    let w: Double
    let h: Double
}

struct Result: Codable {
    let file: String
    let width: Int
    let height: Int
    let boxes: [Box]
    let meanLuma: Double
    let darkRatio: Double
}

func loadCGImage(_ path: String) -> CGImage? {
    guard let img = NSImage(contentsOfFile: path) else { return nil }
    var rect = CGRect(origin: .zero, size: img.size)
    return img.cgImage(forProposedRect: &rect, context: nil, hints: nil)
}

func analyze(path: String) -> Result? {
    guard let cg = loadCGImage(path) else { return nil }
    let W = cg.width, H = cg.height

    // Luma stats
    let cs = CGColorSpaceCreateDeviceGray()
    var luma = [UInt8](repeating: 0, count: W * H)
    var meanLuma = 0.0, dark = 0
    if let ctx = CGContext(data: &luma, width: W, height: H, bitsPerComponent: 8,
                           bytesPerRow: W, space: cs, bitmapInfo: 0) {
        ctx.draw(cg, in: CGRect(x: 0, y: 0, width: W, height: H))
        var sum = 0.0
        for v in luma { sum += Double(v); if v < 24 { dark += 1 } }
        meanLuma = sum / Double(W * H)
    }

    let req = VNRecognizeTextRequest()
    req.recognitionLevel = .accurate
    req.recognitionLanguages = ["zh-Hans", "en-US"]
    req.usesLanguageCorrection = false
    let handler = VNImageRequestHandler(cgImage: cg, options: [:])
    try? handler.perform([req])

    var boxes: [Box] = []
    for obs in (req.results ?? []) {
        guard let cand = obs.topCandidates(1).first else { continue }
        let b = obs.boundingBox
        boxes.append(Box(text: cand.string, confidence: cand.confidence,
                         x: Double(b.origin.x), y: Double(1 - b.origin.y - b.height),
                         w: Double(b.width), h: Double(b.height)))
    }
    return Result(file: path, width: W, height: H, boxes: boxes,
                  meanLuma: meanLuma, darkRatio: Double(dark) / Double(W * H))
}

let paths = Array(CommandLine.arguments.dropFirst())
var out: [Result] = []
for p in paths {
    if let r = analyze(path: p) { out.append(r) } else {
        FileHandle.standardError.write("cannot read \(p)\n".data(using: .utf8)!)
    }
}
let enc = JSONEncoder()
enc.outputFormatting = [.prettyPrinted, .withoutEscapingSlashes]
print(String(data: try! enc.encode(out), encoding: .utf8)!)
