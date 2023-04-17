/**
 * Version		Name		    Date		     Notes
 * 1.0			Maneendra.G		6/12/2022		Initial version
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
                try {
                    var itemSearchObj = search.create({
                        type: "item",
                        filters: [
                            ["isinactive", "is", "F"],
                            "AND",
                            ["internalid", "anyof", "6179"],
                            "AND",
                            ["pricing.pricelevel", "anyof", "2"]
                        ],
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
                            search.createColumn({
                                name: "binnumber",
                                label: "Bin Number"
                            }),
                            search.createColumn({
                                name: "binonhandavail",
                                label: "Bin On Hand Available"
                            }),
                            search.createColumn({
                                name: "unitprice",
                                join: "pricing"
                            }),


                        ]
                    });
                    var searchResultCount = itemSearchObj.runPaged().count;
                    log.debug("invoiceSearchObj result count", searchResultCount);
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
                            let [detail1,detail2,detail3,detail4,detail5,detail6]=[]
                            if (productdetail) {
                                let producttaxt = productdetail.split(",");
                                producttaxt.map(function (test) {
                                if(test.indexOf('product_detail_1')!=-1){
                                    detail1.push(test);
                                }else if(test.indexOf('product_detail_2')!=-1){
                                    detail2.push(test);
                                }else if(test.indexOf('product_detail_3')!=-1){
                                    detail3.push(test);
                                }else if(test.indexOf('product_detail_4')!=-1){
                                    detail4.push(test);
                                }else if(test.indexOf('product_detail_5')!=-1){
                                    detail5.push(test);
                                }else if(test.indexOf('product_detail_6')!=-1){
                                    detail6.push(test);
                                }
                                })
                            }
                            log.debug('productdetail', typeof productdetail);
                            itemdetails.push({
                                "itemName": item,
                                "Id": result.getValue(result.columns[0]),
                                "Item Images ": result.getValue({
                                    name: 'custitem_tss_item_image_url'
                                }),
                                "Collection": result.getText(result.columns[2]),
                                "Copy": result.getValue(result.columns[3]),
                                "Material": result.getText(result.columns[4]),
                                "Gemstone": result.getText(result.columns[5]),
                                "UPC": result.getValue(result.columns[6]),
                                "Silhouette": result.getText(result.columns[7]),
                                "Cost": result.getValue(result.columns[8]),
                                "Tech Desc": result.getValue(result.columns[9]),
                                "MSRP": result.getValue({
                                    name: "unitprice",
                                    join: "pricing"
                                }),
                                Detail1:detail1,
                                Detail2:detail2,
                                Detail3:detail3,
                                Detail4:detail4,
                                Detail5:detail5,
                                Detail6:detail6,
                                "Item Status": result.getValue(result.columns[11]),
                                "Template": result.getValue(result.columns[12]),
                                "Image": result.getValue(result.columns[13]),
                                "Carat Weight": result.getValue(result.columns[14]),
                                "Weight": result.getValue(result.columns[15]),
                                "HTS Code": result.getValue({
                                    name: 'custitem_mb_item_hts_code'
                                }),
                            })

                            return true;
                        });
                    } else {
                        itemdetails.push('NO Result found')
                    }
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