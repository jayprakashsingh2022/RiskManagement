using riskmanagement as rm from '../db/schema';

//Annotate Risks elements
annotate rm.Risks with {
    ID      @title : 'Risk ID';
    title   @title : 'Title';
    owner   @title : 'Owner';
    prio    @title : 'Priority';
    descr   @title : 'Description';
    miti    @title : 'Mitigation';
    impact  @title : 'Impact';
    bp      @title : 'Business Partner';
};

annotate rm.Mitigations with {
    ID              @(UI.Hidden, Common: {Text : description,});
    owner           @title : 'Owner';
    description     @title : 'Description';
};

annotate rm.Risks with {
    miti    @(
        Common: {
            // show text, not ID in the context of risks
            Text : miti.description,
            TextArrangement : #TextOnly,
            ValueList : {
                $Type           : 'Common.ValueListType',
                CollectionPath  : 'Mitigations',
                Label           : 'Mitigations',
                Parameters : [
                    {
                        $Type : 'Common.ValueListParameterInOut',
                        LocalDataProperty : miti_ID,
                        ValueListProperty : 'ID',
                    },
                    {
                        $Type : 'Common.ValueListParameterDisplayOnly',
                        ValueListProperty : 'description',
                    },
                ],
            },
        }
    );
    bp      @(
        Common: {
            // show last name of business partner instead of ID in context of risks
            Text : bp.LastName,
            TextArrangement : #TextOnly,
            ValueList : {
                $Type : 'Common.ValueListType',
                CollectionPath : 'BusinessPartners',
                Label : 'Business Partners',
                Parameters : [
                    {
                        $Type : 'Common.ValueListParameterInOut',
                        LocalDataProperty : bp_BusinessPartner,
                        ValueListProperty : 'BusinessPartner',
                    },
                    {
                        $Type : 'Common.ValueListParameterDisplayOnly',
                        ValueListProperty : 'FirstName',
                    },
                    {
                        $Type : 'Common.ValueListParameterDisplayOnly',
                        ValueListProperty : 'LastName',
                    },
                ],
            },
        }
    );
};
