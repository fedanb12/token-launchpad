const COLORS = {
    surface: "#0A1520",
    border: "#0F2535",
};

export function SkeletonBox({ width = "100%", height = 20, style = {} }) {
    return (
        <div style={{
            width,
            height,
            background: `linear-gradient(90deg, #0A1520 25%, #0F2535 50%, #0A1520 75%)`,
            backgroundSize: "200% 100%",
            animation: "shimmer 1.5s infinite",
            borderRadius: 2,
            ...style,
        }} />
    );
}

export function TokenCardSkeleton() {
    return (
        <div style={{
            background: COLORS.surface,
            border: `1px solid ${COLORS.border}`,
            padding: 20,
        }}>
            <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
            <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 14 }}>
                <SkeletonBox width={48} height={48} />
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                    <SkeletonBox width="60%" height={14} />
                    <SkeletonBox width="30%" height={10} />
                </div>
            </div>
            <SkeletonBox height={11} style={{ marginBottom: 6 }} />
            <SkeletonBox width="70%" height={11} style={{ marginBottom: 14 }} />
            <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 12, borderTop: `1px solid ${COLORS.border}` }}>
                <SkeletonBox width="40%" height={10} />
                <SkeletonBox width="20%" height={10} />
            </div>
        </div>
    );
}

export function TokenPageSkeleton() {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
            <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, padding: 24, display: "flex", gap: 20, alignItems: "center" }}>
                <SkeletonBox width={64} height={64} />
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
                    <SkeletonBox width="40%" height={24} />
                    <SkeletonBox width="20%" height={12} />
                    <SkeletonBox width="60%" height={12} />
                </div>
                <SkeletonBox width={120} height={32} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                {[1, 2, 3].map(i => <SkeletonBox key={i} height={64} />)}
            </div>
            <SkeletonBox height={200} />
        </div>
    );
}