import type { OnboardingBlock } from "../content/onboarding";

export function OnboardingBlocks({ blocks }: { blocks: OnboardingBlock[] }) {
  return (
    <div className="space-y-3 text-sm leading-relaxed text-slate-600">
      {blocks.map((block, i) => {
        switch (block.type) {
          case "p":
            return <p key={i}>{block.text}</p>;
          case "ul":
            return (
              <ul key={i} className="list-disc space-y-1.5 pl-5">
                {block.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol key={i} className="list-decimal space-y-1.5 pl-5">
                {block.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ol>
            );
        }
      })}
    </div>
  );
}
