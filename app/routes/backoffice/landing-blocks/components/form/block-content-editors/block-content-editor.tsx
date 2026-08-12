import type { LandingBlock } from "wle-core";
import { CollectionGridContentEditor } from "./collection-grid-content-editor";
import { ComparisonContentEditor } from "./comparison-content-editor";
import { CtaBannerContentEditor } from "./cta-banner-content-editor";
import { FaqContentEditor } from "./faq-content-editor";
import { FeaturedProductsContentEditor } from "./featured-products-content-editor";
import { HeroContentEditor } from "./hero-content-editor";
import { StoryContentEditor } from "./story-content-editor";
import { TestimonialsContentEditor } from "./testimonials-content-editor";
import { TrustBarContentEditor } from "./trust-bar-content-editor";

interface BlockContentEditorProps {
    blockType: LandingBlock['block_type'];
    value: Record<string, any>;
    onChange: (value: Record<string, any>) => void;
}

export function BlockContentEditor({ blockType, value, onChange }: BlockContentEditorProps) {
    switch (blockType) {
        case 'hero':
            return <HeroContentEditor value={value} onChange={onChange} />;

        case 'cta_banner':
            return <CtaBannerContentEditor value={value} onChange={onChange} />;

        case 'trust_bar':
            return <TrustBarContentEditor value={value} onChange={onChange} />;

        case 'collection_grid':
            return <CollectionGridContentEditor value={value} onChange={onChange} />;

        case 'faq':
            return <FaqContentEditor value={value} onChange={onChange} />;

        case 'comparison':
            return <ComparisonContentEditor value={value} onChange={onChange} />;

        case 'featured_products':
            return <FeaturedProductsContentEditor value={value} onChange={onChange} />;

        case 'story':
            return <StoryContentEditor value={value} onChange={onChange} />;

        case 'testimonials':
            return <TestimonialsContentEditor value={value} onChange={onChange} />

        default:
            // fallback: raw JSON editor
            return (
                <div className="space-y-1.5">
                    <label className="text-xs font-medium">Additional JSON data</label>
                    <textarea
                        rows={6}
                        className="w-full rounded-md border font-mono text-sm p-2"
                        value={JSON.stringify(value, null, 2)}
                        onChange={(e) => {
                            try {
                                onChange(JSON.parse(e.target.value));
                            } catch { /* ignore invalid JSON */ }
                        }}
                    />
                </div>
            );
    }
}