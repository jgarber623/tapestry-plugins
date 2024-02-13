function identify() {
  setIdentifier(null);
}

function load() {
  loadAsync()
    .then(processResults)
    .catch(processError);
}

async function loadAsync() {
  const text = await sendRequest("https://earthobservatory.nasa.gov/feeds/image-of-the-day.rss");
  const obj = xmlParse(text);

  const link = "https://earthobservatory.nasa.gov/topic/image-of-the-day";

  return obj.rss.channel.item.map(item => {
    const creator = Creator.createWithUriName(link, item["dc:creator"]);

    creator.avatar = "https://www.nasa.gov/wp-content/plugins/nasa-hds-core-setup/assets/favicons/mstile-310x310.png";
    // creator.avatar = "https://earthobservatory.nasa.gov/img/logo-mark.svg";

    const [longitude, latitude] = item["georss:point"].split(' ');

    const content = `\
      <p>${item.description}</p>
      <p>View on <a href="https://earthobservatory.nasa.gov/map#5/${latitude}/${longitude}">EO Explorer</a> or <a href="https://earth.google.com/web/search/${latitude},${longitude}">Google Earth</a>.</p>
    `;

    const post = Post.createWithUriDateContent(item.link, new Date(item.pubDate), content);

    const attachment = Attachment.createWithMedia(item["media:thumbnail$attrs"].url);

    post.attachments = [attachment];

    post.creator = creator;

    return post;
  });
}
