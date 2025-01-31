var goToUrlAndSetLocalStorage = require('../../../shared/specUtils')
    .goToUrlAndSetLocalStorage;
var assert = require('assert');
const { getElementByTestHandle } = require('../../../shared/specUtils');
const CBIOPORTAL_URL = process.env.CBIOPORTAL_URL.replace(/\/$/, '');

describe('plots tab tests', function() {
    it('shows data availability alert tooltip for plots tab multiple studies', () => {
        goToUrlAndSetLocalStorage(
            `${CBIOPORTAL_URL}/results/plots?Action=Submit&RPPA_SCORE_THRESHOLD=2.0&Z_SCORE_THRESHOLD=2.0&cancer_study_list=lgg_ucsf_2014%2Cbrca_tcga&case_set_id=all&data_priority=0&gene_list=TP53&geneset_list=%20&plots_coloring_selection=%7B%7D&plots_horz_selection=%7B"selectedGeneOption"%3A7157%2C"dataType"%3A"clinical_attribute"%2C"selectedDataSourceOption"%3A"CANCER_TYPE_DETAILED"%7D&plots_vert_selection=%7B"selectedGeneOption"%3A7157%2C"dataType"%3A"clinical_attribute"%2C"selectedDataSourceOption"%3A"CANCER_TYPE"%7D&profileFilter=0&tab_index=tab_visualize`
        );
        $('div[data-test="PlotsTabPlotDiv"]').waitForDisplayed({
            timeout: 20000,
        });
        // Tooltip elements are created when hovering the data availability alert info icon.
        // Control logic below is needed to access the last one after it
        // was created.
        var curNumToolTips = $$('div.rc-tooltip-inner').length;
        $("[data-test='dataAvailabilityAlertInfoIcon']").moveTo();
        browser.waitUntil(
            () => $$('div.rc-tooltip-inner').length > curNumToolTips
        );
        var toolTips = $$('div.rc-tooltip-inner');
        var text = toolTips[toolTips.length - 1].getText();
        assert.equal(
            text,
            'Data availability per profile/axis:\nHorizontal Axis: 1164 samples from 2 studies\nVertical Axis: 1164 samples from 2 studies\nIntersection of the two axes: 1164 samples from 2 studies'
        );
    });
    it('logscale available for all raw data types that are number', () => {
        goToUrlAndSetLocalStorage(
            `${CBIOPORTAL_URL}/results/plots?Action=Submit&RPPA_SCORE_THRESHOLD=2.0&Z_SCORE_THRESHOLD=2.0&cancer_study_list=lgg_ucsf_2014%2Cbrca_tcga&case_set_id=all&data_priority=0&gene_list=TP53&geneset_list=%20&plots_coloring_selection=%7B%7D&plots_horz_selection=%7B"selectedGeneOption"%3A7157%2C"dataType"%3A"clinical_attribute"%2C"selectedDataSourceOption"%3A"TMB_NONSYNONYMOUS"%2C"logScale"%3A"false"%7D&plots_vert_selection=%7B"selectedGeneOption"%3A7157%2C"dataType"%3A"clinical_attribute"%2C"selectedDataSourceOption"%3A"CANCER_TYPE"%7D&profileFilter=0&tab_index=tab_visualize`
        );

        $('div[data-test="PlotsTabPlotDiv"]').waitForDisplayed({
            timeout: 20000,
        });

        assert.equal(
            getElementByTestHandle('HorizontalLogCheckbox').isExisting(),
            true
        );
        assert.equal(
            getElementByTestHandle('VerticalLogCheckbox').isExisting(),
            false,
            'Log Scale Checkbox should not be availble raw data type is not number'
        );
    });
});
