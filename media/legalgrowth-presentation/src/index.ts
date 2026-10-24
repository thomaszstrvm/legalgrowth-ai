import { registerRoot } from "remotion";
import { RemotionRoot } from "./Root";
import { installAudioAudit } from "./audioAudit";

installAudioAudit();
registerRoot(RemotionRoot);
