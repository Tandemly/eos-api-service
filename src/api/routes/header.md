## Introduction (in file)

This project was built to be a separate REST/JSON API service for third-party
applications to use for communicating with an existing EOS blockchain network.
It's built as a standalone service, as opposed to directly implemented in EOS,
to provide for:

* cleaner separate of concerns,
* help lessen the processing load and memory footprint of EOS
* provide a standard API service that third-party developers can utilize with
  their existing toolchain, libraries and frameworks.

The service relies on the existence of at leaset one node on the EOS network it
connects to be running the `db_plugin` and `http_plugin`. The `db_plugin` is
built to sync and stream irreversible blocks (transactions/actions) and account
information to an external mongodb that serves as the data source for this API
service for all GET requests. This means:

* the API provides snapshot information from the EOS blockchain network it
  services
* the related block/transaction/actions information it serves are only those
  added to the chain (irreversible)
* it doesn't overload the EOS network nodes with requests and can scale based on
  user needs

This documentation is organized around the available `resources` provided by the
API service. These are standard REST resources and provide typical endpoints for
getting a collection of resoures or a single resource. The API also provides the
following abilities, which can be found in the last section of this guide:

* limiting/selecting the specific fields to return for a resources
* filtering of collection resources
* paging of collection resources, and
* sorting of collection resources

The resources provided by the API service are as follows:

### API Specific

* Auth `/v1/auth` - set of services for registering and managing API service
  users and their access tokens
* User `/v1/users` - resources representing API service users

### EOS Specific

* Blocks `/v1/blocks` - resource representing the most recent snapshot of
  irreversible blocks on the EOS blockchain
* Transactions `/v1/transactions` - resource representation of the transactions
  and their actions
* Accounts `/v1/accounts` - resources representing accounts on the EOS
  blockchain

## Authentication

This API service is an authenticated service. That means that someone making a
request must have a valid authorization token. Our authorization tokens use JWT
(JSON Web Tokens), which are received when making calls to the register, login
or refresh-token API endpoints.

To make a valid API call, you can take a received token from one of the
previously mentioned calls and pass it as the `Authorization` header on your
HTTP(s) requests. This is a `Bearer` type token and can be passed as follows in
the HTTP headers:

```
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE1MTIzNTU1NzgsImlhdCI6MTUxMjM1NDY3OCwic3ViIjoiNWExNTBiNDhlMGEyMWIwYWVmNGFiYzU1In0.WT2vKAK6hdHXBCWGRIzxo7KwRE6e_szvhwb0eO48lUA
```
