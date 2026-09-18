export default function AccessDeniedPage() {
  return (
    <main className="gs-page-shell">
      <section className="gs-page-hero">
        <p className="gs-eyebrow">Operator access</p>
        <h1>Access denied</h1>
        <p className="gs-page-description">
          Your identity is signed in, but it is not authorized for GearSwipe operator tools.
        </p>
        <a className="gs-button gs-button-primary" href="/">Return to GearSwipe</a>
      </section>
    </main>
  );
}
