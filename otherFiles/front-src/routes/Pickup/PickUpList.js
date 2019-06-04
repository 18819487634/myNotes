import React, { PureComponent, Fragment } from 'react';
import { Table } from 'antd';

import styles from './PickUpProfile.less';
import { queryPickup, getTrackStatusForId } from '../../services/api';

// const productData = new Map();

export default class PickUpList extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      data: props.dataSource,
      columns: props.columns,
      loading: false,
      pagination: props.pagination,
      pageindex: 1,
      pagesize: 12,
    };
  }
  componentDidMount() {
    
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.value.length > 0) {
      const nextValue = nextProps.value;
      nextValue.splice(nextValue.length - 1, 1);
      this.setState({
        data: nextValue,
      });
    } else {
      this.setState({
        data: nextProps.dataSource,
      });
    }
  }

  handleStandardTableChange = pagination => {
    const { form, dispatch } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      this.setState({
        pageindex: pagination.current,
        pagesize: pagination.pageSize,
      });
      const terms = `terms[0].value=0&terms[0].column=type&pageSize=${
        pagination.pageSize
      }&pageIndex=${pagination.current - 1}`;
      this.query(terms);
    });
  };
  query = terms => {
    queryPickup(terms).then(response => {
      if (response && response.status === 200) {
        const arr = response.result.data;
        const trackids = [];
        for (let i = 0; i < arr.length; i += 1) {
          trackids.push(arr[i].trackid);
        }
        if (trackids.length === 0) {
          trackids.push(null);
        }
        getTrackStatusForId(trackids).then(res => {
          if (res && res.status === 200) {
            let trackData = [];
            const results = res.result;
            const resultmap = new Map();
            const trackmap = new Map();
            for (const key in results) {
              if (key in results) {
                trackData = results[`${key}`];

                trackData.reverse((a, b) => a.buildtime < b.buildtime);
                resultmap.set(key, trackData[0].type);
                trackmap.set(key, trackData);
              }
            }
          }
        });
      }
    });
  };

  render() {
    const dataSource = this.state.data;

    return (
      <Fragment>
        <div className={styles.tableList}>
          <Table
            loading={this.state.loading}
            columns={this.state.columns}
            dataSource={dataSource}
            pagination={this.state.pagination}
            rowKey={record => record.key}
            onChange={this.onChange}
          />
        </div>
      </Fragment>
    );
  }
}
