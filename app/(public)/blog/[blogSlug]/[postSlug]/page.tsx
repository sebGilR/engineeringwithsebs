export default function PostPage({
  params,
}: {
  params: { blogSlug: string; postSlug: string };
}) {
  return (
    <article>
      <h1>Post: {params.postSlug}</h1>
      <p>Blog: {params.blogSlug}</p>
    </article>
  );
}
