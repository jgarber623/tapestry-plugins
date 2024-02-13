function load() {
  loadAsync()
    .then(processResults)
    .catch(processError);
}

async function loadAsync() {
  const text = await sendRequest("https://daily.bandcamp.com/feed");
  const obj = xmlParse(text);

  const link = obj.rss.channel.link;

  return obj.rss.channel.item.map(item => {
    const creator = Creator.createWithUriName(link, item["dc:creator"]);

    creator.avatar = "https://s4.bcbits.com/img/favicon/apple-touch-icon.png";

    const matches = item.description.match(/<p>.*?<\/p>/g);
    const [_, imageUrl] = matches[0].match(/<img\s+(?:.+)?src="(.+?)"(?:\s+.+)?>/);

    const content = (imageUrl ? matches.slice(1) : matches).join('');

    const post = Post.createWithUriDateContent(item.link, new Date(item["dc:date"]), content);

    if (imageUrl) {
      const attachment = Attachment.createWithMedia(imageUrl);

      post.attachments = [attachment];
    }

    post.creator = creator;

    return post;
  });
}
