const MyInfo = () => {
  const infoList = [
    {
      label: 'Email',
      value: 'art.1025p@gmail.com',
    },
    {
      label: 'Birth',
      value: '2001.10.25',
    },
    {
      label: 'Residence',
      value: 'Gyeonggi-do, Seongnam',
    },
  ]
  return (
    <div className="myInfo-wrap animate__animated animate__fadeIn">
      <p className="job-title">web-developer</p>
      <ul>
        {infoList.map((el, i) => {
          return (
            <li key={i}>
              <span className="label">{el.label}</span>
              <span className="value">{el.value}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

const MainView = () => {
  return (
    <>
      <h2 className="title-01 portfoilo-text animate__animated animate__fadeIn">
        Portfoilo
      </h2>

      <MyInfo />
    </>
  )
}
export default MainView
