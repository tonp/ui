/* eslint-disable import/no-dynamic-require,global-require */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import { getDistributions } from 'actions';
import strings from 'lang';
import Table from 'components/Table';
import {
  sum,
  abbreviateNumber,
  getOrdinal,
} from 'utility';
import Warning from 'components/Alerts';
import TabBar from 'components/TabBar';
import Spinner from 'components/Spinner';
import Heading from 'components/Heading';
import styled from 'styled-components';
import { DistributionGraph } from 'components/Visualizations';
import constants from '../constants';

const CountryDiv = styled.div`
  & img {
    vertical-align: sub;
    margin-right: 7px;
    height: 24px;
    width: 32px;
    box-shadow: 0 0 5px ${constants.defaultPrimaryColor};
  }

  & span {
    vertical-align: super;
    height: 24px;
  }
`;
const StyledWarning = styled(Warning)`
  font-size: ${constants.fontSizeCommon};
  text-align: center;
  margin-bottom: 20px;
`;

const countryMmrColumns = [{
  displayName: strings.th_rank,
  field: '',
  displayFn: (row, col, field, i) => getOrdinal(i + 1),
}, {
  displayName: strings.th_country,
  field: 'common',
  sortFn: true,
  displayFn: (row) => {
    const code = row.loccountrycode.toLowerCase();
    const image = `/assets/images/flags/${code}.svg`;
    let name = row.common;

    // Fill missed flags and country names
    if (code === 'yu') {
      name = 'Yugoslavia';
    } else if (code === 'fx') {
      name = 'Metropolitan France';
    } else if (code === 'tp') {
      name = 'East Timor';
    } else if (code === 'zr') {
      name = 'Zaire';
    } else if (code === 'bq') {
      name = 'Caribbean Netherlands';
    } else if (code === 'sh') {
      name = 'Saint Helena, Ascension and Tristan da Cunha';
    }

    return (
      <CountryDiv>
        <img
          src={image}
          alt=""
        />
        <span>
          {name}
        </span>
      </CountryDiv>
    );
  },
}, {
  displayName: strings.th_players,
  field: 'count',
  sortFn: true,
}, {
  displayName: strings.th_mmr,
  field: 'avg',
  sortFn: true,
}];

const getPage = (data, key) => (
  <div>
    <Heading
      title={strings[`distributions_heading_${key}`]}
      subtitle={`
        ${data[key] && data[key].rows && abbreviateNumber(data[key].rows.map(row => row.count).reduce(sum, 0))} ${strings.th_players}
      `}
      icon=" "
      twoLine
    />
    {(key === 'mmr') ?
      <DistributionGraph data={data} />
      : <Table data={data[key] && data[key].rows} columns={countryMmrColumns} />}
  </div>
);

const distributionsPages = [
  {
    name: strings.distributions_tab_mmr, key: 'mmr', content: getPage, route: '/distributions/mmr',
  },
  {
    name: strings.distributions_tab_country_mmr,
    key: 'countryMmr',
    content: data => getPage(data, 'country_mmr'),
    route: '/distributions/countryMmr',
  },
];

class RequestLayer extends React.Component {
  componentDidMount() {
    this.props.dispatchDistributions();
  }
  render() {
    const loading = this.props.loading;
    const info = this.props.match.params.info || 'mmr';
    const page = distributionsPages.find(_page => (_page.key || _page.name.toLowerCase()) === info);
    return loading
      ? <Spinner />
      : (<div>
        <Helmet title={page ? page.name : strings.distributions_tab_mmr} />
        <StyledWarning>
          {strings.distributions_warning_1}
          <br />
          {strings.distributions_warning_2}
        </StyledWarning>
        <TabBar info={info} tabs={distributionsPages} />
        {page && page.content(this.props.data, info)}
      </div>);
  }
}

RequestLayer.propTypes = {
  loading: PropTypes.bool,
  match: PropTypes.shape({
    params: PropTypes.shape({
      info: PropTypes.string,
    }),
  }),
  dispatchDistributions: PropTypes.func,
  data: PropTypes.shape({}),
};

const mapStateToProps = state => ({
  data: state.app.distributions.data,
  loading: state.app.distributions.loading,
});

const mapDispatchToProps = dispatch => ({
  dispatchDistributions: () => dispatch(getDistributions()),
});

export default connect(mapStateToProps, mapDispatchToProps)(RequestLayer);
