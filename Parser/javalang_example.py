import javalang

code = """
/*  
 *   This file is part of the computer assignment for the
 *   Information Retrieval course at KTH.
 * 
 *   Johan Boye, 2017
 */

package ir;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.StringTokenizer;
import java.util.Iterator;
import java.nio.charset.*;
import java.io.*;

/**
 * A class for representing a query as a list of words, each of which has
 * an associated weight.
 */
public class Query {

    /**
     * Help class to represent one query term, with its associated weight.
     */
    class QueryTerm {
        String term;
        double weight;

        QueryTerm(String t, double w) {
            term = t;
            weight = w;
        }
    }

    /**
     * Representation of the query as a list of terms with associated weights.
     * In assignments 1 and 2, the weight of each term will always be 1.
     */
    public ArrayList<QueryTerm> queryterm = new ArrayList<QueryTerm>();

    /**
     * Relevance feedback constant alpha (= weight of original query terms).
     * Should be between 0 and 1.
     * (only used in assignment 3).
     */
    double alpha = 0.2;

    /**
     * Relevance feedback constant beta (= weight of query terms obtained by
     * feedback from the user).
     * (only used in assignment 3).
     */
    double beta = 1 - alpha;

    /**
     * Creates a new empty Query
     */
    public Query() {
    }

    /**
     * Creates a new Query from a string of words
     */
    public Query(String queryString) {
        StringTokenizer tok = new StringTokenizer(queryString);
        while (tok.hasMoreTokens()) {
            queryterm.add(new QueryTerm(tok.nextToken(), 1.0));
        }
    }

    public void addTermToQuery(String term, double weight) {
        queryterm.add(new QueryTerm(term, weight));
    }

    /**
     * Returns the number of terms
     */
    public int size() {
        return queryterm.size();
    }

    /**
     * Returns the Manhattan query length
     */
    public double length() {
        double len = 0;
        for (QueryTerm t : queryterm) {
            len += t.weight;
        }
        return len;
    }

    /**
     * Returns a copy of the Query
     */
    public Query copy() {
        Query queryCopy = new Query();
        for (QueryTerm t : queryterm) {
            queryCopy.queryterm.add(new QueryTerm(t.term, t.weight));
        }
        return queryCopy;
    }

    /**
     * Expands the Query using Relevance Feedback
     *
     * @param results       The results of the previous query.
     * @param docIsRelevant A boolean array representing which query results the
     *                      user deemed relevant.
     * @param engine        The search engine object
     */
    public void relevanceFeedback(PostingsList results, boolean[] docIsRelevant, Engine engine) {

        Query queryCopy = copy();

        int numRelevantDocs = 0;

        // Hashmap of terms in relevant documents and their sum of tf values
        HashMap<String, Double> relevantTerms = new HashMap<String, Double>();

        // Compute the centroid of the relevant documents

        // Get all terms from relevant documents and add them to the relevant terms
        // hashmap
        for (int i = 0; i < docIsRelevant.length; i++) {
            if (docIsRelevant[i]) {
                numRelevantDocs++;
                int docID = results.get(i).docID;

                // Get the document vector and add it to the relevant terms hashmap
                HashMap<String, Integer> docVector = Index.tfVec.get(docID);
                for (String term : docVector.keySet()) {
                    if (relevantTerms.containsKey(term)) {
                        relevantTerms.put(term, relevantTerms.get(term) + docVector.get(term));
                    } else {
                        relevantTerms.put(term, (double) docVector.get(term));
                    }
                }
            }
        }

        // Divide the sum of the document vectors by the number of relevant documents,
        // weight the terms by beta and add to the query

        // Merge the relevant terms with the query terms and reweight original query
        for (QueryTerm term : queryCopy.queryterm) {
            term.weight *= alpha;
            if (relevantTerms.containsKey(term.term)) {
                double prevWeight = term.weight;

                // Set new weight with respect to relevant docs
                term.weight = (relevantTerms.get(term.term) * beta / numRelevantDocs) + prevWeight;

                // delete from relevant terms hashmap
                relevantTerms.remove(term.term);
            }
        }

        for (String term : relevantTerms.keySet()) {
            queryCopy.queryterm.add(new QueryTerm(term, relevantTerms.get(term) * beta / numRelevantDocs));
        }

        // Replace the old query with the new one
        this.queryterm = queryCopy.queryterm;

    }
}"""

try: 
    tree = javalang.parse.parse(code)
    print(tree.attrs) # PackageDeclaration, ImportDeclarations, TypeDeclarations

    for method in tree.types[0].methods:
        print("methodName: ", method.name)
        print("returnType: ", method.return_type)
        print("Documentation: ", method.documentation)
        print("\n")

except Exception as e:
    print("Parsing Error: ", e)