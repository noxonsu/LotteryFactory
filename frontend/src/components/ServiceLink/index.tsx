import styled from 'styled-components';

const Link = styled.a`
  color: inherit;
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`;

const ServiceLinkDiv = styled.div`
  align-item: center;
  font-size: 11px;
  margin-top: 10px;
  color: gray;

`

const ServiceLink = () => {
  return (
    <ServiceLinkDiv>
      Powered by
      {' '}
      <Link href="https://onout.org/lottery"  target="_blank" rel="noreferrer">OnOut - no-code tool to create Lottery</Link>
    </ServiceLinkDiv>
  )

};

export default ServiceLink;