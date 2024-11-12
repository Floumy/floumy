import {
  FacebookIcon,
  FacebookShareButton,
  LinkedinIcon,
  LinkedinShareButton,
  RedditIcon,
  RedditShareButton,
  TwitterShareButton,
  XIcon
} from "react-share";
import React from "react";

export default function PublicShareButtons({ title }) {

  const currentUrl = window.location.href;

  return (
    <div className="pb-3">
      <TwitterShareButton url={currentUrl} title={title}>
        <XIcon size={24} round />
      </TwitterShareButton>
      &nbsp;
      <LinkedinShareButton url={currentUrl} title={title}>
        <LinkedinIcon size={24} round />
      </LinkedinShareButton>
      &nbsp;
      <RedditShareButton url={currentUrl} title={title}>
        <RedditIcon size={24} round />
      </RedditShareButton>
      &nbsp;
      <FacebookShareButton url={currentUrl} quote={title}>
        <FacebookIcon size={24} round />
      </FacebookShareButton>
    </div>);
}
