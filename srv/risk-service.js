const cds = require("@sap/cds");

// service implementation with handlers
module.exports = cds.service.impl(async function () {
  const { Risks, BusinessPartners } = this.entities;

  // connect to remote service
  const BPSrv = await cds.connect.to("API_BUSINESS_PARTNER");
  //jay
  
  // set criticality after READ operation
  this.after("READ", Risks, (data) => {
    const risks = Array.isArray(data) ? data : [data];

    risks.forEach((risk) => {
      risk.criticality = risk.impact >= 100000 ? 1 : 2;
    });
  });

  // to handle $expand=bp call
  this.on("READ", Risks, async (req, next) => {
    // /*
    // Check whether the request wants an "expand" of the business partner
    // As this is not possible, the risk entity and the business partner entity are in different systems (SAP BTP and S/4 HANA Cloud),
    // if there is such an expand, remove it
    // */
    // const expandIndex = req.query.SELECT.columns.findIndex(
    //   ({ expand, ref }) => expand && ref[0] === "bp"
    // );
    // console.log(req.query.SELECT.columns);
    // if (expandIndex < 0) return next();

    // req.query.SELECT.columns.splice(expandIndex, 1);
    // if (
    //   !req.query.SELECT.columns.find((column) =>
    //     column.ref.find((ref) => ref == "bp_BusinessPartner")
    //   )
    // ) {
    //   req.query.SELECT.columns.push({ ref: ["bp_BusinessPartner"] });
    // }

    // /*
    // Instead of carrying out the expand, issue a separate request for each business partner
    // This code could be optimized, instead of having n requests for n business partners, just one bulk request could be created
    // */
    // try {
    //   const res = await next();
    //   await Promise.all(
    //     res.map(async (risk) => {
    //       const bp = await BPSrv.transaction(req).send({
    //         query: SELECT.one(this.entities.BusinessPartners)
    //           .where({ BusinessPartner: risk.bp_BusinessPartner })
    //           .columns(["BusinessPartner", "LastName", "FirstName"]),
    //         headers: {
    //           apikey: process.env.apikey,
    //         },
    //       });
    //       risk.bp = bp;
    //     })
    //   );
    // } catch (error) {
    //   console.error(error);
    // }
    try {
      const res = await next();
      const aColumns = req.query.SELECT.columns || [];
      const aBpColumn = aColumns.find((column) => column.ref.includes("bp"));
      if (aBpColumn.expand && aBpColumn.expand.length > 0) {
        // $expand=bp was used
        const aRiskBps = Array.isArray(res)
          ? res.map((risk) => risk.bp_BusinessPartner)
          : res.bp_BusinessPartner
          ? [res.bp_BusinessPartner]
          : undefined;
        if (!aRiskBps) {
          return res;
        }
        const aBps = await BPSrv.send({
          query: SELECT.from(BusinessPartners)
            .where({ BusinessPartner: { in: aRiskBps } })
            .columns(["BusinessPartner", "FirstName", "LastName"]),
          headers: {
            apiKey: process.env.apiKey,
          },
        });
        const assignBp = (risk) => {
          risk.bp = aBps.find(
            (data) => data.BusinessPartner === risk.bp_BusinessPartner
          );
        };
        if (Array.isArray(res)) {
          res.forEach(assignBp);
        } else {
          assignBp(res);
        }
      }
    } catch (error) {
      console.error(error);
    }
  });

  // event handler for Query on business partners, this calls the external service and returns the response
  this.on("READ", BusinessPartners, async (req) => {
    // API sandbox returns lots of records with blank first and last name so let's filter those out
    req.query.where("LastName <> '' and FirstName <> ''");

    return await BPSrv.transaction(req).send({
      query: req.query,
      headers: {
        apiKey: process.env.apiKey,
      },
    });
  });
});
