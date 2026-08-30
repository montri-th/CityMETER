import { createHash } from "node:crypto";
import { readFileSync, renameSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const output = join(root, "data/citymeter-unified-navbar-r7-v31.receipt.json");
const checkOnly = process.argv.includes("--check");
const shellAssetManifest = JSON.parse(readFileSync(join(root, "assets/unified-navbar-assets-v31.manifest.json"), "utf8"));

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

function stableJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function artifact(path, role) {
  const bytes = readFileSync(join(root, path));
  return {
    path,
    role,
    bytes: bytes.byteLength,
    sha256: sha256(bytes)
  };
}

const artifacts = [
  artifact("index.html", "thai_initial_html"),
  artifact("en/index.html", "english_initial_html"),
  artifact("assets/unified-navbar-r7-v30.css", "unified_nav_styles"),
  artifact("assets/unified-navbar-r7-v31.js", "unified_nav_runtime"),
  artifact("assets/landometer-symbol-color.png", "approved_identity_symbol"),
  artifact("assets/material-symbols-rounded-citymeter-nav-outline-r1.ttf", "nav_icon_subset_outline"),
  artifact("assets/material-symbols-rounded-citymeter-nav-filled-r1.ttf", "nav_icon_subset_filled"),
  artifact("assets/licenses/material-symbols-Apache-2.0.txt", "icon_font_license"),
  artifact("assets/unified-navbar-assets-v31.manifest.json", "shell_asset_manifest")
];

const receipt = {
  schemaVersion: "1.0.0-citymeter-shell-release",
  status: "approved_for_publication",
  releaseAuthority: {
    authority: "site_owner",
    authorizedAt: "2026-08-30",
    scope: "Apply the attached unified navbar r7 handoff to the CityMETER Showcase and publish it again at the existing GitHub Pages URL, aligned with the concurrently rebuilt Landometer Home"
  },
  publication: {
    publishable: true,
    mustNotDeploy: false,
    target: "https://montri-th.github.io/CityMETER/"
  },
  identityApproval: {
    id: "owner-citymeter-navbar-r7-20260830",
    status: "approved",
    blocking: false,
    requiredAuthority: "brand_identity_authority_or_documented_delegate",
    approvedBy: "project_owner",
    authorityRole: "brand_identity_authority_or_documented_delegate",
    approvedAt: "2026-08-30",
    assetPath: shellAssetManifest.identity.path,
    assetSha256: shellAssetManifest.identity.sha256,
    assembledVariant: "full_colour_symbol_plus_typed_Arvo_700_wordmark_#757575",
    transparentCanvas: true,
    placement: "direct_surface",
    surfaces: ["navbar_light_#F6F7F3", "navbar_dark_#11191D"],
    context: "CityMETER production navbar only",
    validFrom: "2026-08-30",
    expiresAt: null,
    approvalRef: "owner-citymeter-navbar-r7-20260830",
    evidence: {
      type: "owner_instruction_in_conversation",
      verbatim: "ผมจะให้พี่ไปเปลี่ยน navbar + motion ในนี้ https://montri-th.github.io/CityMETER/ เลยน่ะ",
      interpretation: "Approve and publish the attached navbar and motion treatment directly on the existing CityMETER production URL",
      acceptedContrastRisk: "2.01:1 full-colour symbol contrast on navbar_dark_#11191D"
    }
  },
  product: "CityMETER",
  releaseReceipt: "2026-08-30-citymeter-unified-nav-r7-v31",
  artifactBuildId: "ui-20260830-09",
  designSystem: {
    version: "0.9.0",
    authoringRevision: "r7",
    authoringSourceSha256: "52ef41f1b231f8b84955a40c21a018991a114a4f5eaabd8c5111816bf8d645b1",
    colorSetId: "color-srgb-05",
    referenceArtifactBuildId: "ui-20260821-05",
    alignmentStatus: "authoring_aligned_with_owner_directed_artifact_exceptions",
    machinePackageConformance: false,
    unmergedR8ProposalClaimed: false,
    riddimProposalUse: "reference_only_no_governed_adapter",
    selfCheckStatus: "pending_rendered_production_matrix"
  },
  sourceReferences: {
    unifiedNavbarHandoffSha256: "47a26f9546316856357040d7a716619a8fa5289484851b4d25bdbb9501ef60fa",
    riddimProposalSha256: "accb6eafa7d881cfc83633391e0e0f13c54b9077bc2dcf5e0f265cc65bdc4c60",
    referenceHomeCommit: "d65858c0227b34b4ee8116bdd41711af2d72069e",
    referenceHomeUrl: "https://montri-th.github.io/rebuild02/Landometer-Home-TH.dc.html"
  },
  implementation: {
    strategy: "standalone_shell_outside_hydrated_react_root",
    inheritedHydratedBundle: "assets/index-qbT50gkr-v17.js",
    hiddenLegacyHeaderSelector: "#root > .site-header",
    legacyHeaderExclusivity: "initial_html_critical_rule_plus_external_css",
    outsidePointerFocus: "preserve_real_destination_else_restore_trigger",
    localAnchors: ["decisions", "examples", "datasets"],
    desktopPostLogoControls: 4,
    compactPostLogoControls: 1,
    compactControlBreakpoint: 820,
    compactSizeTokenBreakpoint: 600,
    scrollspy: "requestAnimationFrame_geometry_marker_with_visible_fallback",
    reducedMotion: "prominent_header_and_no_cta_sweep",
    noJs: "visible_static_fallback_navigation"
  },
  ownerDirectedExceptions: [
    {
      id: "NAV-IDENTITY-01",
      decision: "Use the owner-approved color symbol on both themes and typed Arvo wordmark",
      acceptedRisk: "Identity approval owner-citymeter-navbar-r7-20260830 accepts the handoff-recorded 2.01:1 symbol contrast on the dark canvas for the CityMETER production navbar only"
    },
    {
      id: "NAV-WORDMARK-01",
      decision: "Use #757575 for the typed wordmark in both themes",
      acceptedRisk: "Artifact-level exception; not a normative DS r8 merge"
    },
    {
      id: "NAV-CALM-01",
      decision: "Use the r7 handoff row-scale calm state after downward scroll",
      acceptedRisk: "Visible calm controls are below 44px and restore before pointer, focus, or menu activation"
    },
    {
      id: "MOTION-01",
      decision: "Allow one continuous yellow text sweep on the contact CTA",
      acceptedRisk: "The duplicate is aria-hidden and pointer-inert; reduced motion removes it"
    },
    {
      id: "FIT-01",
      decision: "Hide the plain product indicator below 901px and switch to the compact one-control composition at 820px while retaining the exact 600px size-token switch",
      acceptedRisk: "Fit hardening for 320–900px; the page H1 and current ecosystem row retain CityMETER identity"
    },
    {
      id: "NAV-UTILITY-01",
      decision: "Do not expose theme or locale utilities in the CityMETER unified navbar, matching the attached CityMETER preset",
      acceptedRisk: "The real English sibling and first-paint system/stored theme remain functional, but they are not discoverable as navbar controls in this artifact"
    },
    {
      id: "FLOW-04",
      decision: "Use icon-only 44px menu and bookmark-rail controls with accessible names and tooltips",
      acceptedRisk: "The visible icon is never the sole accessible label; every control retains aria-label and title evidence"
    },
    {
      id: "NAV-RAIL-01",
      decision: "Expose local CityMETER sub-navigation as a fixed three-item desktop bookmark rail",
      acceptedRisk: "The rail is hidden in compact composition and the same local links remain available inside the menu"
    },
    {
      id: "NAV-ZINDEX-01",
      decision: "Use local shell layering values for header, rail, menu and skip link",
      acceptedRisk: "Values are isolated to the standalone shell pending a future shared package adoption; rendered overlap is a release-gate check"
    }
  ],
  inheritedContributorLayer: {
    releaseReceipt: "2026-08-27-landom-thumbnail-sync-v29",
    manifest: "data/citymeter-contributor-release-p1-7712069325b3.json",
    manifestSha256: "7712069325b33b3310d434908be674265250c7776c69b95bdfa9a020baea442b",
    registry: "data/citymeter-contributors-p1-c1d0f5a7c057.json",
    registrySha256: "c1d0f5a7c0571ae799365c24f4238f3eeba507db99a88e2a00cc692fb761146f",
    invariants: {
      records: 38,
      assignments: 51,
      uniquePeople: 29,
      portraitIdentities: 25,
      fallbackIdentities: 4
    }
  },
  iconSubset: {
    source: `${shellAssetManifest.materialSymbolsRounded.provider} ${shellAssetManifest.materialSymbolsRounded.family}`,
    sourceVersion: shellAssetManifest.materialSymbolsRounded.providerCssVersion,
    license: shellAssetManifest.materialSymbolsRounded.license.spdx,
    axes: shellAssetManifest.materialSymbolsRounded.commonAxes,
    outlineGlyphs: shellAssetManifest.materialSymbolsRounded.outline.ligatures.map((item) => item.name),
    filledGlyphs: shellAssetManifest.materialSymbolsRounded.filled.ligatures.map((item) => item.name)
  },
  artifacts,
  aggregate: {
    algorithm: "sha256(stable-json-artifact-array)",
    artifactCount: artifacts.length,
    totalBytes: artifacts.reduce((sum, item) => sum + item.bytes, 0),
    sha256: sha256(stableJson(artifacts))
  }
};

const expected = Buffer.from(stableJson(receipt));
if (checkOnly) {
  const actual = readFileSync(output);
  if (!actual.equals(expected)) throw new Error("Unified-navbar release receipt drifted from delivered bytes");
  if (statSync(output).size !== expected.byteLength) throw new Error("Unified-navbar receipt size drifted");
  console.log(`Checked ${receipt.releaseReceipt}: ${receipt.aggregate.sha256}`);
} else {
  const temporary = `${output}.tmp-${process.pid}`;
  writeFileSync(temporary, expected);
  renameSync(temporary, output);
  console.log(`Built ${receipt.releaseReceipt}: ${receipt.aggregate.sha256}`);
}
