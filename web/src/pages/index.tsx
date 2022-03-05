import { withUrqlClient } from "next-urql"
import { NavBar } from "../components/NavBar"
import { usePostsQuery } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";

// Server-side render content that can be searchable or appear in a google search
// Or dynamic data
// Pages like the login and register are static and can be client-side rendered
const Index = () => {
  const [{ data }] = usePostsQuery();
  return (
    <>
      <NavBar/>
      <div> Helloworld </div>
      <br/>
      { !data ? <div> Loading yo... </div> : data.posts.map((p) => <div key={p.id}>{p.title}</div>)}
    </>
  );
};

export default withUrqlClient(createUrqlClient,  { ssr: true })(Index);
