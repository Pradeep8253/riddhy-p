import { siteConfig, isConfigured } from '@/lib/site-config';
import styles from './AboutSections.module.css';

export default function AboutStory({ config = siteConfig } = {}) {
  if (!isConfigured(config.story.founderNarrative)) {
    return null;
  }

  return (
    <section className={`section ${styles.storySection}`}>
      <div className="container">
        <div className={styles.storyContent}>
          <span className="kicker">Origin & Purpose</span>
          <h2>Rooted in warmth, built for real life.</h2>
          <p>{config.story.founderNarrative}</p>
        </div>
      </div>
    </section>
  );
}
