const Link = require("../models/Link");
const isUrl = require("valid-url").isWebUri;
const axios = require("axios");
const dns = require("dns");
const url = require("url");

module.exports.list = async (req, res) => {
  try {
    const links = await Link.find();

    if (!links) return res.send({ success: false, errorId: 1 });

    res.send({ success: true, links: links });
  } catch (err) {
    console.log("Error on linkController.list: ", err.message);

    res.send({ success: false, error: err.message });
  }
};

// module.exports.validate = async (req, res) => {
//   try {
//     let incomingLink = req.body.incomingLink;
//     console.log("incomingLink -> ", incomingLink);

//     isUrl(incomingLink, { require_host: true })
//       ? (async () => {
//           const response = await axios.get(incomingLink);
//           response.status >= 200 && response.status < 300
//             ? res.send({ success: true })
//             : res.send({ success: false });
//         })()
//       : res.send({ success: false });
//   } catch (err) {
//     console.log("Error on link validation: ", err.message);

//     res.send({ success: false });
//   }
// };

module.exports.validate = async (req, res) => {
  try {
    let incomingLink = req.body.incomingLink;
    console.log("incomingLink -> ", incomingLink);

    // Perform DNS lookup

    const { hostname } = new URL(incomingLink);
    await dns.promises.lookup(hostname, (err, address, family) => {
      if (err) {
        console.log("Error on DNS lookup:", err.message);

        res.send({ success: false });
        return;
      }

      // Check if URL is valid and reachable
      isUrl(incomingLink, { require_host: true })
        ? (async () => {
            const response = await axios.get(incomingLink);
            response.status >= 200 && response.status < 300
              ? res.send({ success: true })
              : res.send({ success: false });
          })()
        : res.send({ success: false });
    });
  } catch (err) {
    console.log("Error on link validation: ", err.message);

    res.send({ success: false });
  }
};

module.exports.add = async (req, res) => {
  try {
    const newLink = await Link.create(req.body);

    if (!newLink) return res.send({ success: false, errorId: 1 });

    res.send({ success: true, newLink });
  } catch (err) {
    console.log("Error on linkController.add: ", err.message);
    res.send({ success: false, error: err.message });
  }
};

module.exports.delete = async (req, res) => {
  try {
    const deletedLink = await Link.findByIdAndDelete(req.params._id);

    if (!deletedLink) return res.send({ success: false, errorId: 1 });

    res.send({ success: true });
  } catch (err) {
    console.log("Error on linkController.delete: ", err.message);
    res.send({ success: false, error: err.message });
  }
};

module.exports.redirectLink = async (req, res) => {
  try {
    const shortUrl = await Link.findOne({ shortUrl: req.params.shortUrl });

    if (!shortUrl)
      return res.status(404).send({ success: false, error: "Link not found" });

    shortUrl.clicks++;
    shortUrl.save();

    const docObj = shortUrl.toObject();
    console.log("docObj from redirectLink in server controller -> ", docObj);

    // res.send({ redirectUrl: docObj.originalUrl });

    res.redirect(docObj.originalUrl);
  } catch (err) {
    console.log("Error on shortLink redirecting: ", err.message);
    res.status(500).send({ success: false, error: err.message });
  }
};
