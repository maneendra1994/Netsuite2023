/**
 * Version		Name		    Date		     Notes
 * 1.0			Maneendra.G		18/04/2023		Initial version
 * 
 */
/**
 * @NApiVersion 2.1
 * @NScriptType Restlet
 */
define(['N/query', 'N/search'],
   /**
    * @param{query} query
    * @param{search} search
    */
   (query, search) => {
      /**
       * Defines the function that is executed when a POST request is sent to a RESTlet.
       * @param {string | Object} requestBody - The HTTP request body; request body is passed as a string when request
       *     Content-Type is 'text/plain' or parsed into an Object when request Content-Type is 'application/json' (in which case
       *     the body must be a valid JSON)
       * @returns {string | Object} HTTP response body; returns a string when request Content-Type is 'text/plain'; returns an
       *     Object when request Content-Type is 'application/json' or 'application/xml'
       * @since 2015.2
       */
      const post = (requestBody) => {
         try {
            let respObj = {};
            let itemdetails = [];
            const functionName = "post";
            respObj['hasError'] = false;
            let action = requestBody["action"];
            log.debug('action', action);
            let itemArr = requestBody["Data"];
            let itemnamefilter=[];

            try {
               // 
               // if(items.length>0){
               log.debug('items', itemArr);
               let itemsArr = [];
               let items = [];
               let count=0;
               for (let i in itemArr) {
                  itemsArr.push(itemArr[i]);
                 if(count==0){
                   itemnamefilter.push(["name","contains",itemArr[i]]);
                 }else{
                    itemnamefilter.push("OR");
                    itemnamefilter.push(["name","contains",itemArr[i]]);
                 }
                 count++;
               }
               log.debug('itemsArr', itemsArr);
               let text = itemsArr.toString().replace(/,/g, "','");
               log.debug('serials', text);
               let binnumber = {};
               let itmefilters = [];
               itmefilters.push(["inventorylocation", "anyof", "263"]);
              log.debug('itemnamefilter',itemnamefilter);''
               if (text) {
                  text = "('" + text + "')";
                          log.debug('text',text);
                  const itemQuery = `SELECT item.itemid,item.id FROM item WHERE  item.itemid IN ` + text + ``;
                  let itemDetailsObj = query.runSuiteQL({
                     query: itemQuery,
                  });

                  let itemObjLen = itemDetailsObj.results.length;
                  log.debug(itemObjLen)
                  for (let i = 0; i < itemObjLen; i++) {
                     let resultset = itemDetailsObj.results[i].values;
                     items.push(resultset[1]);
                  }
                  // let iterator = itemDetailsObj.iterator();
                  /* if (itemObjLen > 0) {
                     
                   }*/
                  if (itemObjLen > 0) {
                     itmefilters.push("AND")
                     itmefilters.push(["internalid", "anyof", items]);
                  }

                  // itmefilters.push(["formulanumeric: CASE WHEN {name} IN ('" + text + "') THEN 1 ELSE 0 END", "equalto", "1"]);
               }

               var itembinSearchObj = search.create({
                  type: "item",
                  filters: itmefilters,
                  columns: [
                     search.createColumn({
                        name: "locationquantityavailable",
                        label: "Bin Number"
                     })
                  ]
               });
             
               itmefilters.push("AND")
               itmefilters.push(["pricing.pricelevel", "anyof", "2"]);
              let pricelevel=[];
                 var itempriceSearchObj = search.create({
                  type: "item",
                  filters: itmefilters,
                  columns: [
                      search.createColumn({
                        name: "unitprice",
                        join: "pricing"
                     }),
                  ]
               });
                itempriceSearchObj.run().each(function (result) {
                  pricelevel[result.id] = result.getValue({
                      name: "unitprice",
                        join: "pricing"
                  });
                  return true;
               });
               
               log.debug('itembinSearchObj', itembinSearchObj);
               //var searchResultCount = itemSearchObj.runPaged().count;
               itembinSearchObj.run().each(function (result) {
                  binnumber[result.id] = result.getValue({
                     name: 'locationquantityavailable'
                  });
                  return true;
               });log.debug('binnumber',binnumber);
              
               let itemfilters_text = [];
               itemfilters_text.push(["isinactive", "is", "F"]);
               if (text &&items.length>0) {
                  itemfilters_text.push("AND")
                  itemfilters_text.push(["internalid", "anyof", items]);
               }
              if(itemArr&&items.length==0){
                 itemdetails.push('NO Result found')
              }else{
              /* else {
                  itemfilters_text.push("AND")
                  itemfilters_text.push(["pricing.pricelevel", "anyof", "2"]);
               }*/
               log.debug('itemfilters_text', itemfilters_text);
               var itemSearchObj = search.create({
                  type: "item",
                  filters: itemfilters_text,
                  columns: [
                     search.createColumn({
                        name: "internalid",
                        label: "Internal ID"
                     }),
                     search.createColumn({
                        name: "itemid",
                        sort: search.Sort.ASC,
                        label: "Name"
                     }),
                     search.createColumn({
                        name: "custitem_mb_collection",
                        label: "Collection"
                     }),
                     search.createColumn({
                        name: "custitem_mb_shopify_status",
                        label: "copy"
                     }),
                     search.createColumn({
                        name: "custitem_mb_metal",
                        label: "metal"
                     }),
                     search.createColumn({
                        name: "custitem_mb_gemstone",
                        label: "gemstone"
                     }),
                     search.createColumn({
                        name: "upccode",
                        label: "UPC Code"
                     }),
                     search.createColumn({
                        name: "custitem_mb_silhouette",
                        label: "silhouette"
                     }),
                     search.createColumn({
                        name: "baseprice",
                        label: "Base Price"
                     }),
                     search.createColumn({
                        name: "description",
                        label: "description"
                     }),
                     search.createColumn({
                        name: "custitem_mb_item_legacy_status",
                        label: "item status"
                     }),
                     search.createColumn({
                        name: "custitem_mb_image_map_template",
                        label: "image map"
                     }),
                     search.createColumn({
                        name: "custitem_tss_item_image_url",
                        label: "Image Url"
                     }),
                     search.createColumn({
                        name: "custitem_mb_item_carat_weight",
                        label: "carat weight"
                     }),
                     search.createColumn({
                        name: "custitem_mb_item_weight",
                        label: "item weight"
                     }),
                     search.createColumn({
                        name: "custitem_mb_item_hts_code",
                        label: "htscode"
                     }),
                     search.createColumn({
                        name: "custitem_mb_coo",
                        label: "Manufacturer Country"
                     }),
                     search.createColumn({
                        name: "custitem_celigo_shopify_product_tags",
                        join: "parent",
                        label: "Shopify Product Tags"
                     }),
                    /* search.createColumn({
                        name: "binnumber",
                        label: "Bin Number"
                     }),
                     search.createColumn({
                        name: "binonhandavail",
                        label: "Bin On Hand Available"
                     }),*/
                   
                  ]
                 ,title:'item search'
               });
               var searchResultCount = itemSearchObj.runPaged().count;
               log.debug("searchResultCount result count",searchResultCount);
               if (searchResultCount > 0) {
                  let resultSet = getSearchResult(itemSearchObj);
                  resultSet.forEach(function (result) {
                     let assemblytext = result.getValue(result.columns[1])
                     let trntaxt = assemblytext.split(":");
                     let item = trntaxt[trntaxt.length - 1].trim();
                     let productdetail = result.getText({
                        name: "custitem_celigo_shopify_product_tags",
                        join: "parent",
                        label: "Shopify Product Tags"
                     });
                     let [detail1, detail2, detail3, detail4, detail5, detail6] = [
                        [],
                        [],
                        [],
                        [],
                        [],
                        []
                     ]
                     if (productdetail) {
                        let producttaxt = productdetail.split(",");
                        producttaxt.map(function (test) {
                           if (test.indexOf('product_detail_1') != -1) {
                              detail1.push(test);
                           } else if (test.indexOf('product_detail_2') != -1) {
                              detail2.push(test);
                           } else if (test.indexOf('product_detail_3') != -1) {
                              detail3.push(test);
                           } else if (test.indexOf('product_detail_4') != -1) {
                              detail4.push(test);
                           } else if (test.indexOf('product_detail_5') != -1) {
                              detail5.push(test);
                           } else if (test.indexOf('product_detail_6') != -1) {
                              detail6.push(test);
                           }
                        })
                     }
                     itemdetails.push({
                        "itemName": item,
                        "Id": result.getValue(result.columns[0]),
                        "Item Images ": result.getValue({
                           name: 'custitem_tss_item_image_url'
                        }),
                        "Available Units": binnumber[result.getValue(result.columns[0])],
                        "Collection": result.getText(result.columns[2]),
                        "Copy": result.getValue(result.columns[3]),
                        "Material": result.getText(result.columns[4]),
                        "Gemstone": result.getText(result.columns[5]),
                        "UPC": result.getValue(result.columns[6]),
                        "Silhouette": result.getText(result.columns[7]),
                        "Cost": result.getValue(result.columns[8]),
                        "Tech Desc": result.getValue(result.columns[9]),
                        "MSRP": pricelevel[result.getValue(result.columns[0])]/*result.getValue({
                           name: "unitprice",
                           join: "pricing"
                        })*/,
                        Detail1: detail1,
                        Detail2: detail2,
                        Detail3: detail3,
                        Detail4: detail4,
                        Detail5: detail5,
                        Detail6: detail6,
                        "Item Status": result.getValue(result.columns[10]),
                        "Template": result.getValue({
                           name: 'custitem_mb_image_map_template'
                        }),
                        "Image": result.getValue(result.columns[12]),
                        "Carat Weight": result.getValue({
                           name: 'custitem_mb_item_carat_weight'
                        }),
                        "Weight": result.getValue({
                           name: 'custitem_mb_item_weight'
                        }),
                        "HTS Code": result.getValue({
                           name: 'custitem_mb_item_hts_code'
                        }),
                        "Country of Origin": result.getText({
                           name: 'custitem_mb_coo'
                        }),

                     })

                     return true;
                  });
               } else {
                  itemdetails.push('NO Result found')
               }
              }
               //}else{
               //   itemdetails.push('NO Result found')
               //}
            } catch (e) {
               log.error('ERROR', e)
               respObj['error'] = e.message;
            }
            return respObj['itemsData'] = itemdetails;

         } catch (e) {
            log.error('ERROR', e)
         }
      }
      /**
       * Get the search result
       */
      const getSearchResult = (pagedDataObj) => {
         let pagedData = pagedDataObj.runPaged({
            pageSize: 1000
         });
         let resultDetails = new Array();
         pagedData.pageRanges.forEach(function (pageRange) {
            let myPage = pagedData.fetch({
               index: pageRange.index
            });
            myPage.data.forEach(function (result) {
               resultDetails.push(result);
            });
         });
         return resultDetails;
      };
      return {
         post
      }


   });