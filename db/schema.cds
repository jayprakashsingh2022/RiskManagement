namespace riskmanagement;

using { managed } from '@sap/cds/common';

entity Risks : managed {
    key ID      : UUID  @(Core.Computed : true);
    title       : String(100);
    prio        : String(5);
    owner       : String;
    descr       : String;
    miti        : Association to Mitigations;
    impact      : Integer;
    criticality : Integer;
    bp          : Association to BusinessPartners;
}

entity Mitigations : managed {
    key ID      : UUID @(Core.Computed: true);
    description : String;
    owner       : String;
    timeline    : String;
    risks       : Association to many Risks on risks.miti = $self;
}

using { API_BUSINESS_PARTNER as external } from '../srv/external/API_BUSINESS_PARTNER.csn';

entity BusinessPartners as projection on external.A_BusinessPartner {
    key BusinessPartner,
    LastName,
    FirstName
};