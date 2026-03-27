import Blob "mo:core/Blob";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Int "mo:core/Int";
import Time "mo:core/Time";
import Array "mo:core/Array";
import IC "ic:aaaaa-aa";

module {
  public func transform(input : TransformationInput) : TransformationOutput {
    let response = input.response;
    {
      response with headers = [];
    };
  };

  public type TransformationInput = {
    context : Blob;
    response : IC.http_request_result;
  };
  public type TransformationOutput = IC.http_request_result;
  public type Transform = query TransformationInput -> async TransformationOutput;
  public type Header = {
    name : Text;
    value : Text;
  };

  // 100 KB for HTML pages (enough for SEO signals, avoids consensus failures)
  let htmlMaxBytes : Nat64 = 102_400;
  // 50 KB for API JSON responses (PSI, YouTube, etc.)
  let apiMaxBytes : Nat64 = 51_200;

  let httpRequestCycles = 231_000_000_000;

  // Default request — used for API JSON responses (PSI, etc.)
  public func httpGetRequest(url : Text, extraHeaders : [Header], transform : Transform) : async Text {
    let headers = extraHeaders.concat([{
      name = "User-Agent";
      value = "caffeine.ai";
    }]);
    let http_request : IC.http_request_args = {
      url;
      max_response_bytes = ?apiMaxBytes;
      headers;
      body = null;
      method = #get;
      transform = ?{
        function = transform;
        context = Blob.fromArray([]);
      };
      is_replicated = ?false;
    };
    let httpResponse = await (with cycles = httpRequestCycles) IC.http_request(http_request);
    switch (httpResponse.body.decodeUtf8()) {
      case (null) { "" };
      case (?decodedResponse) { decodedResponse };
    };
  };

  // Use this for fetching HTML pages — larger limit to capture meaningful content
  public func httpGetHtml(url : Text, transform : Transform) : async Text {
    let headers : [Header] = [{
      name = "User-Agent";
      value = "Mozilla/5.0 (compatible; CaffeineBot/1.0)";
    }];
    let http_request : IC.http_request_args = {
      url;
      max_response_bytes = ?htmlMaxBytes;
      headers;
      body = null;
      method = #get;
      transform = ?{
        function = transform;
        context = Blob.fromArray([]);
      };
      is_replicated = ?false;
    };
    let httpResponse = await (with cycles = httpRequestCycles) IC.http_request(http_request);
    switch (httpResponse.body.decodeUtf8()) {
      case (null) { "" };
      case (?decodedResponse) { decodedResponse };
    };
  };

  public func httpPostRequest(url : Text, extraHeaders : [Header], body : Text, transform : Transform) : async Text {
    let headers = extraHeaders.concat([
      { name = "User-Agent"; value = "caffeine.ai" },
      { name = "Idempotency-Key"; value = "Time-" # Time.now().toText() },
    ]);
    let requestBody = body.encodeUtf8();
    let httpRequest : IC.http_request_args = {
      url;
      max_response_bytes = ?apiMaxBytes;
      headers;
      body = ?requestBody;
      method = #post;
      transform = ?{
        function = transform;
        context = Blob.fromArray([]);
      };
      is_replicated = ?false;
    };
    let httpResponse = await (with cycles = httpRequestCycles) IC.http_request(httpRequest);
    switch (httpResponse.body.decodeUtf8()) {
      case (null) { "" };
      case (?decodedResponse) { decodedResponse };
    };
  };
};
