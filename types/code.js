const codeblock = /```(?:(\S+)\n)?\s*([^]+?)\s*```/i;

module.exports = async (phrase, message) => {
	if (!phrase) return null;
	if (/^[0-9]+$/.test(phrase)) {
		try {
			const msg = await message.channel.messages.fetch(phrase);
			phrase = msg.content;
		} catch (err) {
			return { code: phrase, lang: null };
		}
	}
	if (codeblock.test(phrase)) {
		const parsed = codeblock.exec(phrase);
		return {
			code: parsed[2],
			lang: parsed[1] ? parsed[1].toLowerCase() : null
		};
	}
	return { code: phrase, lang: null };
};
