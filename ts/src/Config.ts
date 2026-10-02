
import { BaseFeature } from './feature/base/BaseFeature'
import { TestFeature } from './feature/test/TestFeature'



const FEATURE_CLASS: Record<string, typeof BaseFeature> = {
   test: TestFeature,

}


const FEATURE_PLUGINS: Record<string, any[]> = {
  
}


class Config {

  makeFeature(this: any, fn: string) {
    const fc = FEATURE_CLASS[fn]
    const fi = new fc()
    return fi
  }

  // False for a feature added at runtime via options.extend (station's
  // adopt path) - the constructor uses this to skip makeFeature for names
  // no generated class backs.
  hasFeature(this: any, fn: string) {
    return null != FEATURE_CLASS[fn]
  }


  main = {
    name: 'Archiverif',
        slug: "archiverif",
    version: "0.1.0",
    target: "ts",

  }


  feature = {
     test:     {
      "options": {
        "active": false
      },
      "optspec": {
        "entity": "`$MAP`",
        "net": "`$MAP`"
      },
      "strict": false,
      "transport": "base"
    },

  }


  options = {
    base: "https://verifrbq-backend-production.up.railway.app",

    auth: {
      prefix: '',
      name: 'X-Client-Key',
    },

    headers: {
      "content-type": "application/json"
    },

    entity: {
      
        document_type: {
        },
  
        key_info: {
        },
  
        verify: {
        },
  
        watchlist: {
        },
  
    }
  }


  entity = {
    "document_type": {
      "fields": [
        {
          "name": "code",
          "title": "Code",
          "type": "`$STRING`",
          "req": true
        },
        {
          "name": "is_active",
          "title": "Is Active",
          "type": "`$BOOLEAN`",
          "req": true
        },
        {
          "name": "jurisdiction",
          "title": "Jurisdiction",
          "type": "`$ANY`"
        },
        {
          "name": "label_en",
          "title": "Label En",
          "type": "`$STRING`",
          "req": true
        },
        {
          "name": "label_fr",
          "title": "Label Fr",
          "type": "`$STRING`",
          "req": true
        },
        {
          "name": "order",
          "title": "Order",
          "type": "`$INTEGER`",
          "req": true
        },
        {
          "name": "parsed",
          "title": "Parsed",
          "type": "`$BOOLEAN`",
          "req": true
        },
        {
          "name": "requestable",
          "title": "Requestable",
          "type": "`$BOOLEAN`",
          "req": true
        },
        {
          "name": "reuse_eligible",
          "title": "Reuse Eligible",
          "type": "`$BOOLEAN`",
          "req": true
        },
        {
          "name": "short_en",
          "title": "Short En",
          "type": "`$STRING`",
          "req": true
        },
        {
          "name": "short_fr",
          "title": "Short Fr",
          "type": "`$STRING`",
          "req": true
        },
        {
          "name": "validity_hint_en",
          "title": "Validity Hint En",
          "type": "`$ANY`"
        },
        {
          "name": "validity_hint_fr",
          "title": "Validity Hint Fr",
          "type": "`$ANY`"
        },
        {
          "name": "verify_note_en",
          "title": "Verify Note En",
          "type": "`$ANY`"
        },
        {
          "name": "verify_note_fr",
          "title": "Verify Note Fr",
          "type": "`$ANY`"
        },
        {
          "name": "verify_url",
          "title": "Verify Url",
          "type": "`$ANY`"
        }
      ],
      "name": "document_type",
      "op": {
        "list": {
          "input": "data",
          "name": "list",
          "points": [
            {
              "kind": "http",
              "method": "GET",
              "orig": "/v1/document-types",
              "segments": [
                {
                  "lit": "v1"
                },
                {
                  "lit": "document-types"
                }
              ],
              "parts": [
                "v1",
                "document-types"
              ],
              "rename": {},
              "transform": {
                "req": "`reqdata`",
                "res": "`body.results`"
              },
              "args": {
                "query": [
                  {
                    "name": "jurisdiction",
                    "orig": "jurisdiction",
                    "type": "`$ANY`",
                    "kind": "query"
                  }
                ]
              },
              "select": {
                "exist": [
                  "jurisdiction"
                ]
              }
            }
          ]
        }
      },
      "relations": {
        "ancestors": []
      }
    },
    "key_info": {
      "fields": [
        {
          "name": "created_at",
          "title": "Created At",
          "type": "`$STRING`",
          "req": true,
          "format": "date-time"
        },
        {
          "name": "key_preview",
          "title": "Key Preview",
          "type": "`$STRING`",
          "req": true
        },
        {
          "name": "last_used_at",
          "title": "Last Used At",
          "type": "`$ANY`",
          "req": true
        },
        {
          "name": "plan",
          "title": "Plan",
          "type": "`$STRING`",
          "req": true
        },
        {
          "name": "rate_limit_per_minute",
          "title": "Rate Limit Per Minute",
          "type": "`$INTEGER`",
          "req": true
        }
      ],
      "name": "key_info",
      "op": {
        "load": {
          "input": "data",
          "name": "load",
          "points": [
            {
              "kind": "http",
              "method": "GET",
              "orig": "/v1/keys/me",
              "segments": [
                {
                  "lit": "v1"
                },
                {
                  "lit": "keys"
                },
                {
                  "lit": "me"
                }
              ],
              "parts": [
                "v1",
                "keys",
                "me"
              ],
              "rename": {},
              "transform": {
                "req": "`reqdata`",
                "res": "`body`"
              },
              "args": {},
              "select": {}
            }
          ]
        }
      },
      "relations": {
        "ancestors": []
      }
    },
    "verify": {
      "fields": [
        {
          "name": "address",
          "title": "Address",
          "type": "`$ANY`",
          "req": true
        },
        {
          "name": "autre_nom",
          "title": "Autre Nom",
          "type": "`$ANY`",
          "req": true
        },
        {
          "name": "bond_amount",
          "title": "Bond Amount",
          "type": "`$ANY`",
          "req": true
        },
        {
          "name": "bond_company",
          "title": "Bond Company",
          "type": "`$ANY`",
          "req": true
        },
        {
          "name": "categories",
          "title": "Categories",
          "type": "`$ARRAY`",
          "req": true
        },
        {
          "name": "company_name",
          "title": "Company Name",
          "type": "`$ANY`",
          "req": true
        },
        {
          "name": "date_debut_restriction",
          "title": "Date Debut Restriction",
          "type": "`$ANY`",
          "req": true
        },
        {
          "name": "date_delivrance",
          "title": "Date Delivrance",
          "type": "`$ANY`",
          "req": true
        },
        {
          "name": "date_fin_restriction",
          "title": "Date Fin Restriction",
          "type": "`$ANY`",
          "req": true
        },
        {
          "name": "date_paiement_annuel",
          "title": "Date Paiement Annuel",
          "type": "`$ANY`",
          "req": true
        },
        {
          "name": "email",
          "title": "Email",
          "type": "`$STRING`",
          "req": true
        },
        {
          "name": "id",
          "title": "Id",
          "type": "`$STRING`"
        },
        {
          "name": "is_active_today",
          "title": "Is Active Today",
          "type": "`$BOOLEAN`",
          "req": true
        },
        {
          "name": "last_seen",
          "title": "Last Seen",
          "type": "`$STRING`",
          "req": true,
          "format": "date"
        },
        {
          "name": "licence_id",
          "title": "Licence Id",
          "type": "`$STRING`",
          "req": true
        },
        {
          "name": "mandataire",
          "title": "Mandataire",
          "type": "`$ANY`",
          "req": true
        },
        {
          "name": "municipalite",
          "title": "Municipalite",
          "type": "`$ANY`",
          "req": true
        },
        {
          "name": "neq",
          "title": "Neq",
          "type": "`$ANY`",
          "req": true
        },
        {
          "name": "nombre_sous_categories",
          "title": "Nombre Sous Categories",
          "type": "`$ANY`",
          "req": true
        },
        {
          "name": "phone",
          "title": "Phone",
          "type": "`$ANY`",
          "req": true
        },
        {
          "name": "region",
          "title": "Region",
          "type": "`$ANY`",
          "req": true
        },
        {
          "name": "restriction",
          "title": "Restriction",
          "type": "`$ANY`",
          "req": true
        },
        {
          "name": "source",
          "title": "Source",
          "type": "`$STRING`"
        },
        {
          "name": "status",
          "title": "Status",
          "type": "`$STRING`",
          "req": true
        },
        {
          "name": "statut_juridique",
          "title": "Statut Juridique",
          "type": "`$ANY`",
          "req": true
        },
        {
          "name": "suspended_since",
          "title": "Suspended Since",
          "type": "`$ANY`",
          "req": true
        },
        {
          "name": "type_licence",
          "title": "Type Licence",
          "type": "`$ANY`",
          "req": true
        }
      ],
      "id": {
        "field": "id",
        "name": "id"
      },
      "name": "verify",
      "op": {
        "load": {
          "input": "data",
          "name": "load",
          "points": [
            {
              "kind": "http",
              "method": "GET",
              "orig": "/v1/verify/{licence_id}",
              "segments": [
                {
                  "lit": "v1"
                },
                {
                  "lit": "verify"
                },
                {
                  "var": "id"
                }
              ],
              "parts": [
                "v1",
                "verify",
                "{id}"
              ],
              "rename": {
                "param": {
                  "licence_id": "id"
                }
              },
              "transform": {
                "req": "`reqdata`",
                "res": "`body`"
              },
              "args": {
                "params": [
                  {
                    "name": "id",
                    "orig": "licence_id",
                    "type": "`$STRING`",
                    "kind": "param",
                    "reqd": true
                  }
                ]
              },
              "select": {
                "exist": [
                  "id"
                ]
              }
            }
          ]
        }
      },
      "relations": {
        "ancestors": []
      }
    },
    "watchlist": {
      "fields": [],
      "name": "watchlist",
      "op": {
        "load": {
          "input": "data",
          "name": "load",
          "points": [
            {
              "kind": "http",
              "method": "GET",
              "orig": "/v1/watchlist",
              "segments": [
                {
                  "lit": "v1"
                },
                {
                  "lit": "watchlist"
                }
              ],
              "parts": [
                "v1",
                "watchlist"
              ],
              "rename": {},
              "transform": {
                "req": "`reqdata`",
                "res": "`body`"
              },
              "args": {
                "query": [
                  {
                    "name": "include",
                    "orig": "include",
                    "type": "`$ANY`",
                    "kind": "query"
                  },
                  {
                    "name": "limit",
                    "orig": "limit",
                    "type": "`$INTEGER`",
                    "kind": "query",
                    "example": 100
                  },
                  {
                    "name": "offset",
                    "orig": "offset",
                    "type": "`$INTEGER`",
                    "kind": "query",
                    "example": 0
                  }
                ]
              },
              "select": {
                "exist": [
                  "include",
                  "limit",
                  "offset"
                ]
              }
            }
          ]
        }
      },
      "relations": {
        "ancestors": []
      }
    }
  }
}


const config = new Config()

export {
  config,
  FEATURE_PLUGINS,
}

